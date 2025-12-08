'use client'

import { createIncome } from '@/app/actions/income'
import { useTransition, useState } from 'react'
import Toast from './Toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { TrendingUp, Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

interface AddIncomeFormProps {
  categories: Category[]
  onSuccess?: () => void
  compact?: boolean
}

export default function AddIncomeForm({ categories, onSuccess, compact = false }: AddIncomeFormProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const incomeCategories = categories.filter(c => c.type === 'INCOME')

  async function handleSubmit(formData: FormData) {
    if (selectedCategory) {
      formData.set('categoryId', selectedCategory)
    }
    if (selectedDate) {
      formData.set('date', selectedDate.toISOString().split('T')[0])
    }

    startTransition(async () => {
      const result = await createIncome(formData)

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        const form = document.getElementById('income-form') as HTMLFormElement
        form?.reset()
        setSelectedCategory('')
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

      <form id="income-form" action={handleSubmit} className="space-y-4">
        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="income-description" className="text-sm font-medium text-gray-700">
            Descrição
          </Label>
          <Input
            id="income-description"
            name="description"
            placeholder="Ex: Salário, Freelance, Investimentos..."
            required
            disabled={isPending}
            className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="income-amount" className="text-sm font-medium text-gray-700">
              Valor (R$)
            </Label>
            <Input
              id="income-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              required
              disabled={isPending}
              className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Data
            </Label>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder="Selecione a data"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Categoria</Label>
          <div className="flex flex-wrap gap-2">
            {incomeCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                disabled={isPending}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'ring-2 ring-offset-2 ring-green-500 scale-105'
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

        {/* Botão Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-5 w-5" />
              Adicionar Receita
            </>
          )}
        </Button>
      </form>
    </>
  )
}
