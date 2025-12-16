'use client'

import { useState } from 'react'
import { deleteExpense, markExpenseAsPaid } from '@/app/actions/expenses'
import { markInstallmentAsPaid, markInstallmentAsUnpaid, deleteTransaction } from '@/app/actions/cards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, TrendingDown, ArrowUpDown, Check, Clock, CreditCard } from 'lucide-react'
import Toast from './Toast'

interface Expense {
  id: string
  description: string
  amount: number
  dueDate: Date
  isPaid?: boolean
  isFixed?: boolean
  category?: {
    name: string
    color: string
    icon: string | null
  } | null
}

interface Transaction {
  id: string
  cardId: string
  description: string
  totalAmount: number
  purchaseDate: Date
  installmentsCount: number
  card: {
    id: string
    name: string
    color: string
  }
  installments: Installment[]
}

interface Installment {
  id: string
  transactionId: string
  number: number
  amount: number
  dueDate: Date
  isPaid: boolean
}

const CARD_COLORS: Record<string, string> = {
  nubank: '#820AD1',
  inter: '#FF7A00',
  c6blue: '#1F51AC',
  black: '#1A1A1A',
  platinum: '#71717A',
  gold: '#D4AF37',
  red: '#D32F2F',
  graphite: '#424242',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

// Tipo unificado para exibicao
interface UnifiedExpense {
  id: string
  description: string
  amount: number
  dueDate: Date
  isPaid: boolean
  isFixed?: boolean
  category?: {
    name: string
    color: string
    icon: string | null
  } | null
  // Card-specific fields
  isCardExpense: boolean
  cardName?: string
  cardColor?: string
  installmentNumber?: number
  installmentsCount?: number
  transactionId?: string
  installmentId?: string
}

interface ExpenseTableProps {
  expenses: Expense[]
  transactions?: Transaction[]
  searchFilter?: string
  statusFilter?: 'all' | 'pending' | 'paid'
  periodFilter?: 'all' | 'month'
  selectedMonth?: number
  selectedYear?: number
}

export default function ExpenseTable({
  expenses,
  transactions = [],
  searchFilter = '',
  statusFilter = 'all',
  periodFilter = 'month',
  selectedMonth,
  selectedYear,
}: ExpenseTableProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortField, setSortField] = useState<'description' | 'amount' | 'dueDate'>('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Get installments from transactions (filtered by period if needed)
  const cardInstallments: UnifiedExpense[] = transactions.flatMap(t =>
    t.installments
      .filter(inst => {
        if (periodFilter === 'all') return true
        if (selectedMonth === undefined || selectedYear === undefined) return true
        const dueDate = new Date(inst.dueDate)
        return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear
      })
      .map(inst => ({
        id: `card-${inst.id}`,
        description: `${t.description}`,
        amount: inst.amount,
        dueDate: new Date(inst.dueDate),
        isPaid: inst.isPaid,
        isCardExpense: true,
        cardName: t.card.name,
        cardColor: t.card.color,
        installmentNumber: inst.number,
        installmentsCount: t.installmentsCount,
        transactionId: t.id,
        installmentId: inst.id,
      }))
  )

  // Convert regular expenses to unified format
  const regularExpenses: UnifiedExpense[] = expenses.map(exp => ({
    id: exp.id,
    description: exp.description,
    amount: exp.amount,
    dueDate: new Date(exp.dueDate),
    isPaid: exp.isPaid || false,
    isFixed: exp.isFixed,
    category: exp.category,
    isCardExpense: false,
  }))

  // Combine and filter
  let allExpenses = [...regularExpenses, ...cardInstallments]

  allExpenses = allExpenses.filter(exp =>
    exp.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    exp.category?.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    exp.cardName?.toLowerCase().includes(searchFilter.toLowerCase())
  )

  if (statusFilter === 'pending') {
    allExpenses = allExpenses.filter(exp => !exp.isPaid)
  } else if (statusFilter === 'paid') {
    allExpenses = allExpenses.filter(exp => exp.isPaid)
  }

  const sortedExpenses = [...allExpenses].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'description':
        comparison = a.description.localeCompare(b.description)
        break
      case 'amount':
        comparison = a.amount - b.amount
        break
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  async function handleMarkPaid(exp: UnifiedExpense) {
    setLoadingId(exp.id)

    if (exp.isCardExpense && exp.installmentId) {
      const result = exp.isPaid
        ? await markInstallmentAsUnpaid(exp.installmentId)
        : await markInstallmentAsPaid(exp.installmentId)

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro', type: 'error' })
      }
    } else {
      const result = await markExpenseAsPaid(exp.id)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro', type: 'error' })
      }
    }

    setLoadingId(null)
  }

  async function handleDelete(exp: UnifiedExpense) {
    const confirmMsg = exp.isCardExpense
      ? `Excluir compra "${exp.description}"? Todas as parcelas serao removidas.`
      : `Excluir "${exp.description}"?`

    if (confirm(confirmMsg)) {
      setLoadingId(exp.id)

      if (exp.isCardExpense && exp.transactionId) {
        const result = await deleteTransaction(exp.transactionId)
        if (result?.success) {
          setToast({ message: result.message!, type: 'success' })
        } else {
          setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
        }
      } else {
        const result = await deleteExpense(exp.id)
        if (result?.success) {
          setToast({ message: result.message!, type: 'success' })
        } else {
          setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
        }
      }

      setLoadingId(null)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedExpenses.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(sortedExpenses.map(exp => exp.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  if (sortedExpenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
          <TrendingDown className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma despesa encontrada</h3>
        <p className="text-gray-500">
          {searchFilter ? 'Tente outro termo de busca' : 'Clique em "Criar Despesa" para adicionar'}
        </p>
      </div>
    )
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

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === sortedExpenses.length && sortedExpenses.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-2 font-medium hover:bg-transparent"
                onClick={() => toggleSort('description')}
              >
                Descricao
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Categoria/Cartao</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-2 font-medium hover:bg-transparent"
                onClick={() => toggleSort('dueDate')}
              >
                Vencimento
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-2 font-medium hover:bg-transparent"
                onClick={() => toggleSort('amount')}
              >
                Valor
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedExpenses.map((exp) => (
            <TableRow
              key={exp.id}
              className={`${loadingId === exp.id ? 'opacity-50' : ''} ${exp.isPaid ? 'bg-gray-50/50' : ''}`}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(exp.id)}
                  onCheckedChange={() => toggleSelect(exp.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={`font-medium cursor-pointer ${
                    exp.isPaid ? 'text-gray-400 line-through' : exp.isCardExpense ? 'text-blue-600 hover:text-blue-700' : 'text-orange-600 hover:text-orange-700'
                  }`}>
                    {exp.description}
                  </span>
                  {exp.isCardExpense && exp.installmentNumber && exp.installmentsCount && (
                    <Badge variant="outline" className="text-xs py-0 font-mono">
                      {exp.installmentNumber}/{exp.installmentsCount}
                    </Badge>
                  )}
                  {exp.isFixed && (
                    <Badge variant="outline" className="text-xs py-0">
                      <Clock className="w-3 h-3 mr-1" />
                      Fixo
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {exp.isCardExpense ? (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: `${CARD_COLORS[exp.cardColor || ''] || '#6366f1'}15`,
                      color: CARD_COLORS[exp.cardColor || ''] || '#6366f1',
                    }}
                  >
                    <CreditCard className="w-3 h-3 mr-1" />
                    {exp.cardName}
                  </Badge>
                ) : exp.category ? (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: `${exp.category.color}15`,
                      color: exp.category.color,
                    }}
                  >
                    {exp.category.icon} {exp.category.name}
                  </Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-gray-600">
                {formatDate(exp.dueDate)}
              </TableCell>
              <TableCell>
                {exp.isPaid ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Pago
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    Pendente
                  </Badge>
                )}
              </TableCell>
              <TableCell className={`font-semibold ${
                exp.isPaid ? 'text-gray-400' : exp.isCardExpense ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {formatCurrency(exp.amount)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {!exp.isPaid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkPaid(exp)}
                      disabled={loadingId === exp.id}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Marcar como pago"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {exp.isPaid && exp.isCardExpense && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkPaid(exp)}
                      disabled={loadingId === exp.id}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      title="Desmarcar pagamento"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(exp)}
                    disabled={loadingId === exp.id}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    title={exp.isCardExpense ? 'Excluir compra (todas parcelas)' : 'Excluir'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
