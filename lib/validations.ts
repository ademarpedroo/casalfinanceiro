import { z } from 'zod'

// Income validation
export const incomeSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(100, 'Descrição muito longa'),
  amount: z.number().positive('Valor deve ser positivo').max(999999999, 'Valor muito alto'),
  date: z.date(),
  categoryId: z.string().optional(),
})

// Expense validation
export const expenseSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(100, 'Descrição muito longa'),
  amount: z.number().positive('Valor deve ser positivo').max(999999999, 'Valor muito alto'),
  dueDate: z.date(),
  categoryId: z.string().optional(),
  isFixed: z.boolean().default(false),
})

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio').max(50, 'Nome muito longo'),
  type: z.enum(['INCOME', 'EXPENSE'] as const, {
    message: 'Tipo deve ser INCOME ou EXPENSE'
  }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor invalida (use formato #RRGGBB)').default('#3b82f6'),
  icon: z.string().max(2, 'Icone deve ter no maximo 2 caracteres').optional(),
})

// Credit Card validation
export const creditCardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  limit: z.number().positive('Limite deve ser positivo').max(999999999, 'Limite muito alto'),
  closingDay: z.number().int().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31'),
  dueDay: z.number().int().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31'),
})

// Card Transaction validation
export const cardTransactionSchema = z.object({
  cardId: z.string().min(1, 'Cartão é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória').max(100, 'Descrição muito longa'),
  totalAmount: z.number().positive('Valor deve ser positivo').max(999999999, 'Valor muito alto'),
  purchaseDate: z.date(),
  installmentsCount: z.number().int().min(1, 'Mínimo 1 parcela').max(48, 'Máximo 48 parcelas'),
})

// Budget validation
export const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  month: z.number().int().min(1, 'Mês deve ser entre 1 e 12').max(12, 'Mês deve ser entre 1 e 12'),
  year: z.number().int().min(2000, 'Ano inválido').max(2100, 'Ano inválido'),
  limit: z.number().positive('Limite deve ser positivo').max(999999999, 'Limite muito alto'),
})

// Quick Expense validation (simplified for FAB)
export const quickExpenseSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(100, 'Descrição muito longa'),
  amount: z.number().positive('Valor deve ser positivo').max(999999999, 'Valor muito alto'),
  date: z.date(),
  categoryId: z.string().optional(),
})

// Helper to parse FormData to schema
export function parseFormData<T>(
  formData: FormData,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const rawData: Record<string, any> = {}

    formData.forEach((value, key) => {
      // Handle checkboxes
      if (value === 'on') {
        rawData[key] = true
      }
      // Handle empty strings as undefined
      else if (value === '' || value === null) {
        rawData[key] = undefined
      }
      // Handle numbers
      else if (!isNaN(Number(value)) && value !== '') {
        rawData[key] = Number(value)
      }
      // Handle dates (YYYY-MM-DD format)
      else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        rawData[key] = new Date(value)
      }
      // Everything else as string
      else {
        rawData[key] = value
      }
    })

    const result = schema.parse(rawData)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return { success: false, error: firstError.message }
    }
    return { success: false, error: 'Erro de validacao desconhecido' }
  }
}
