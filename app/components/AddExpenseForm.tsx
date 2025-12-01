'use client'
import { createExpense } from '@/app/actions/expenses'
import { useTransition, useState } from 'react'
import Toast from './Toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

export default function AddExpenseForm({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isFixed, setIsFixed] = useState(false)
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

  async function handleSubmit(formData: FormData) {
    if (selectedCategory) {
      formData.set('categoryId', selectedCategory)
    }
    formData.set('isFixed', isFixed ? 'true' : 'false')

    startTransition(async () => {
      const result = await createExpense(formData)

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        const form = document.getElementById('expense-form') as HTMLFormElement
        form?.reset()
        setSelectedCategory('')
        setIsFixed(false)
      } else {
        setToast({ message: result?.error || 'Erro desconhecido', type: 'error' })
      }
    })
  }

  return (
    <>
      <form id="expense-form" action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="Ex: Conta de Luz"
              required
              disabled={isPending}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Valor
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              disabled={isPending}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId" className="text-sm font-medium">
              Categoria
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isPending}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium">
              Vencimento
            </Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              required
              disabled={isPending}
              className="h-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isFixed"
              checked={isFixed}
              onCheckedChange={(checked) => setIsFixed(checked as boolean)}
              disabled={isPending}
            />
            <Label htmlFor="isFixed" className="text-sm font-medium cursor-pointer">
              Conta fixa mensal
            </Label>
          </div>

          <Button
            type="submit"
            className="ml-auto bg-orange-600 hover:bg-orange-700 h-10 px-8"
            disabled={isPending}
          >
            {isPending ? 'Cadastrando...' : 'Adicionar Despesa'}
          </Button>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
