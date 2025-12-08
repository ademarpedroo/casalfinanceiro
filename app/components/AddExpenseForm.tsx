'use client'

import { createExpense } from '@/app/actions/expenses'
import { useTransition, useState } from 'react'
import Toast from './Toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { TrendingDown, Loader2, Clock } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

interface AddExpenseFormProps {
  categories: Category[]
  onSuccess?: () => void
  compact?: boolean
}

export default function AddExpenseForm({ categories, onSuccess, compact = false }: AddExpenseFormProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isFixed, setIsFixed] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

  async function handleSubmit(formData: FormData) {
    if (selectedCategory) {
      formData.set('categoryId', selectedCategory)
    }
    formData.set('isFixed', isFixed ? 'true' : 'false')
    if (selectedDate) {
      formData.set('dueDate', selectedDate.toISOString().split('T')[0])
    }

    startTransition(async () => {
      const result = await createExpense(formData)

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        const form = document.getElementById('expense-form') as HTMLFormElement
        form?.reset()
        setSelectedCategory('')
        setIsFixed(false)
        setSelectedDate(new Date())
        onSuccess?.()
      } else {
        setToast({ message: result?.error || 'Erro desconhecido', type: 'error' })
      }
    })
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form id="expense-form" action={handleSubmit} className="space-y-4">
        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="expense-description" className="text-sm font-medium text-gray-700">
            Descrição
          </Label>
          <Input
            id="expense-description"
            name="description"
            placeholder="Ex: Conta de luz, Mercado, Uber..."
            required
            disabled={isPending}
            className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expense-amount" className="text-sm font-medium text-gray-700">
              Valor (R$)
            </Label>
            <Input
              id="expense-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              required
              disabled={isPending}
              className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500 font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Vencimento
            </Label>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder="Data de vencimento"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Categoria</Label>
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                disabled={isPending}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'ring-2 ring-offset-2 ring-orange-500 scale-105'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.id ? cat.color : `${cat.color}15`,
                  color: selectedCategory === cat.id ? 'white' : cat.color,
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Conta Fixa */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Checkbox
            id="isFixed"
            checked={isFixed}
            onCheckedChange={(checked) => setIsFixed(checked as boolean)}
            disabled={isPending}
            className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
          />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <Label htmlFor="isFixed" className="text-sm font-medium cursor-pointer text-gray-700">
              Conta fixa mensal
            </Label>
          </div>
        </div>

        {/* Botão Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <TrendingDown className="mr-2 h-5 w-5" />
              Adicionar Despesa
            </>
          )}
        </Button>
      </form>
    </>
  )
}
