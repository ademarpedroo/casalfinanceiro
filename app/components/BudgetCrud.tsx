'use client'

import { useState, useTransition } from 'react'
import { createBudget, deleteBudget } from '@/app/actions/budget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Plus, Trash2, Search, PieChart, Loader2, ArrowUpDown, AlertCircle, CheckCircle2 } from 'lucide-react'
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
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

interface BudgetCrudProps {
  budgets: Budget[]
  availableCategories: Category[]
  currentMonth: number
  currentYear: number
}

export default function BudgetCrud({
  budgets,
  availableCategories,
  currentMonth,
  currentYear,
}: BudgetCrudProps) {
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'warning' | 'exceeded'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  let filteredBudgets = budgets.filter(b =>
    b.category.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  if (statusFilter === 'ok') {
    filteredBudgets = filteredBudgets.filter(b => b.percentage < 70)
  } else if (statusFilter === 'warning') {
    filteredBudgets = filteredBudgets.filter(b => b.percentage >= 70 && b.percentage < 100)
  } else if (statusFilter === 'exceeded') {
    filteredBudgets = filteredBudgets.filter(b => b.percentage >= 100)
  }

  const okCount = budgets.filter(b => b.percentage < 70).length
  const warningCount = budgets.filter(b => b.percentage >= 70 && b.percentage < 100).length
  const exceededCount = budgets.filter(b => b.percentage >= 100).length

  const tabs = [
    { value: 'all', label: 'Todos', count: budgets.length },
    { value: 'ok', label: 'Dentro do limite', count: okCount },
    { value: 'warning', label: 'Atencao', count: warningCount },
    { value: 'exceeded', label: 'Excedidos', count: exceededCount },
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('month', String(currentMonth))
    formData.set('year', String(currentYear))
    formData.set('categoryId', selectedCategory)

    startTransition(async () => {
      const result = await createBudget(formData)
      if (result?.success) {
        setToast({ message: 'Orcamento criado!', type: 'success' })
        setIsDialogOpen(false)
        setSelectedCategory('')
      } else {
        setToast({ message: result?.error || 'Erro ao criar', type: 'error' })
      }
    })
  }

  async function handleDelete(id: string, categoryName: string) {
    if (confirm(`Excluir orcamento de "${categoryName}"?`)) {
      setDeletingId(id)
      const result = await deleteBudget(id)
      if (result?.success) {
        setToast({ message: 'Orcamento excluido!', type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
      setDeletingId(null)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBudgets.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredBudgets.map(b => b.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  function getStatusBadge(percentage: number) {
    if (percentage < 70) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">OK</Badge>
    }
    if (percentage < 100) {
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Atencao</Badge>
    }
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Excedido</Badge>
  }

  function getProgressColor(percentage: number): string {
    if (percentage < 70) return 'bg-green-500'
    if (percentage < 100) return 'bg-yellow-500'
    return 'bg-red-500'
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

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Orcamento</h1>
              <Badge
                variant="secondary"
                className="text-sm font-medium"
                style={{ backgroundColor: '#8B5CF615', color: '#8B5CF6' }}
              >
                {monthNames[currentMonth - 1]} {currentYear}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">Defina limites de gastos para cada categoria</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar orcamentos..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 w-[200px] sm:w-[280px] h-10 border-gray-200"
              />
            </div>

            {/* Create Button */}
            {availableCategories.length > 0 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="h-10 font-medium"
                    style={{ backgroundColor: '#8B5CF6' }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Orcamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Criar Orcamento</DialogTitle>
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
                      className="w-full h-11"
                      style={{ backgroundColor: '#8B5CF6' }}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Orcamento
                        </>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'ok' | 'warning' | 'exceeded')} className="w-full">
          <TabsList className="bg-gray-100 p-1 h-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                {tab.label}
                <span className="ml-2 text-gray-500">{tab.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <PieChart className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum orcamento encontrado</h3>
              <p className="text-gray-500">
                {searchFilter ? 'Tente outro termo de busca' : 'Clique em "Criar Orcamento" para adicionar'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredBudgets.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 -ml-2 font-medium hover:bg-transparent"
                    >
                      Categoria
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Limite</TableHead>
                  <TableHead>Gasto</TableHead>
                  <TableHead className="w-48">Progresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget) => (
                  <TableRow key={budget.id} className={deletingId === budget.id ? 'opacity-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(budget.id)}
                        onCheckedChange={() => toggleSelect(budget.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${budget.category.color}15` }}
                        >
                          {budget.category.icon || '📊'}
                        </div>
                        <span className="font-medium text-purple-600 hover:text-purple-700 cursor-pointer">
                          {budget.category.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-700">
                      {formatCurrency(budget.limit)}
                    </TableCell>
                    <TableCell className={`font-semibold ${budget.percentage >= 100 ? 'text-red-600' : 'text-gray-700'}`}>
                      {formatCurrency(budget.spent)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${getProgressColor(budget.percentage)}`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{budget.percentage.toFixed(0)}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(budget.percentage)}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Aviso todas categorias com orcamento */}
        {availableCategories.length === 0 && budgets.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">
                Todas as categorias de despesa ja possuem orcamento para este mes.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
