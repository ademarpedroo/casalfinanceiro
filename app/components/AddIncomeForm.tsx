'use client'
import { createIncome } from '@/app/actions/income'
import { useTransition, useState } from 'react'
import Toast from './Toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

export default function AddIncomeForm({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const incomeCategories = categories.filter(c => c.type === 'INCOME')

  async function handleSubmit(formData: FormData) {
    if (selectedCategory) {
      formData.set('categoryId', selectedCategory)
    }

    startTransition(async () => {
      const result = await createIncome(formData)

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        const form = document.getElementById('income-form') as HTMLFormElement
        form?.reset()
        setSelectedCategory('')
      } else {
        setToast({ message: result?.error || 'Erro desconhecido', type: 'error' })
      }
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <DollarSign className="w-5 h-5" />
            Nova Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form id="income-form" action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                placeholder="Ex: Salário"
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sem categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data Recebimento</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                disabled={isPending}
              />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isPending}>
              {isPending ? 'Cadastrando...' : 'Cadastrar Receita'}
            </Button>
          </form>
        </CardContent>
      </Card>

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
