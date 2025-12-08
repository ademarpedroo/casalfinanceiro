'use client'

import { useState, useTransition } from 'react'
import { createBudget, deleteBudget } from '@/app/actions/budget'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, PieChart, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import Toast from './Toast'

interface Budget {
  id: string
  limit: number
  month: number
  year: number
  spent: number
  percentage: number
  remaining: number
  category: {
    id: string
    name: string
    color: string
    icon: string | null
  }
}

interface Category {
  id: string
  name: string
  color: string
  icon: string | null
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function BudgetManager({
  budgets,
  availableCategories,
  currentMonth,
  currentYear,
}: {
  budgets: Budget[]
  availableCategories: Category[]
  currentMonth: number
  currentYear: number
}) {
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('month', String(currentMonth))
    formData.set('year', String(currentYear))
    formData.set('categoryId', selectedCategory)

    startTransition(async () => {
      const result = await createBudget(formData)
      if (result?.success) {
        setToast({ message: 'Orçamento criado!', type: 'success' })
        setIsDialogOpen(false)
        setSelectedCategory('')
      } else {
        setToast({ message: result?.error || 'Erro ao criar', type: 'error' })
      }
    })
  }

  async function handleDelete(id: string, categoryName: string) {
    if (confirm(`Excluir orçamento de "${categoryName}"?`)) {
      setDeletingId(id)
      const result = await deleteBudget(id)
      if (result?.success) {
        setToast({ message: 'Orçamento excluído!', type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
      setDeletingId(null)
    }
  }

  function getProgressColor(percentage: number): string {
    if (percentage < 70) return 'bg-green-500'
    if (percentage < 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  function getStatusIcon(percentage: number) {
    if (percentage < 70) return <CheckCircle2 className="w-5 h-5 text-green-500" />
    if (percentage < 90) return <AlertCircle className="w-5 h-5 text-yellow-500" />
    return <AlertCircle className="w-5 h-5 text-red-500" />
  }

  // Calcular totais
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{monthNames[currentMonth - 1]} {currentYear}</h2>
              <p className="text-sm text-gray-500">{budgets.length} orçamentos definidos</p>
            </div>
          </div>

          {availableCategories.length > 0 && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Orçamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                      <PieChart className="w-5 h-5 text-white" />
                    </div>
                    Novo Orçamento
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  {/* Categoria */}
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Limite */}
                  <div className="space-y-2">
                    <Label htmlFor="budget-limit">Limite Mensal (R$)</Label>
                    <Input
                      id="budget-limit"
                      name="limit"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="500,00"
                      required
                      disabled={isPending}
                      className="h-11 text-lg font-semibold"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isPending || !selectedCategory}
                    className="w-full h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Orçamento
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Card de Resumo */}
        {budgets.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90">Gasto Total do Mês</p>
                <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Limite Total</p>
                <p className="text-xl font-semibold">{formatCurrency(totalLimit)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uso geral</span>
                <span className="font-semibold">{totalPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    totalPercentage < 70 ? 'bg-green-400' :
                    totalPercentage < 90 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Lista de Orçamentos */}
        {budgets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 mb-4">
              <PieChart className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum orçamento definido</h3>
            <p className="text-gray-500 mb-4">Defina limites de gastos para cada categoria</p>
            {availableCategories.length > 0 && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-violet-500 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Orçamento
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {budgets.map((budget) => (
              <Card
                key={budget.id}
                className={`p-4 border-l-4 transition-all hover:shadow-md ${
                  deletingId === budget.id ? 'opacity-50' : ''
                }`}
                style={{ borderLeftColor: budget.category.color }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${budget.category.color}15` }}
                    >
                      {budget.category.icon || '📊'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{budget.category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(budget.spent)} de {formatCurrency(budget.limit)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(budget.percentage)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(budget.id, budget.category.name)}
                      disabled={deletingId === budget.id}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      {deletingId === budget.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressColor(budget.percentage)}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className={`font-medium ${
                      budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {budget.remaining >= 0 ? 'Disponível:' : 'Excedido:'} {formatCurrency(Math.abs(budget.remaining))}
                    </span>
                    <span className="font-semibold text-gray-700">{budget.percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Aviso todas categorias com orçamento */}
        {availableCategories.length === 0 && budgets.length > 0 && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">
                Todas as categorias de despesa já possuem orçamento para este mês.
              </p>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
