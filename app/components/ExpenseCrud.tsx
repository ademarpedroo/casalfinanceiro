'use client'

import { useState, useMemo } from 'react'
import CrudLayout from './CrudLayout'
import ExpenseTable from './ExpenseTable'
import AddExpenseForm from './AddExpenseForm'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

interface Card {
  id: string
  name: string
  color: string
  brand: string
  lastFourDigits?: string | null
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
  installments: {
    id: string
    transactionId: string
    number: number
    amount: number
    dueDate: Date
    isPaid: boolean
  }[]
}

interface ExpenseCrudProps {
  expenses: Expense[]
  categories: Category[]
  cards?: Card[]
  transactions?: Transaction[]
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

type PeriodFilter = 'all' | 'month'

export default function ExpenseCrud({ expenses, categories, cards = [], transactions = [] }: ExpenseCrudProps) {
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month')

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  // Filter expenses by period
  const filteredExpenses = useMemo(() => {
    if (periodFilter === 'all') return expenses

    return expenses.filter(exp => {
      const dueDate = new Date(exp.dueDate)
      return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear
    })
  }, [expenses, periodFilter, selectedMonth, selectedYear])

  // Filter installments by period
  const filteredInstallments = useMemo(() => {
    const allInstallments = transactions.flatMap(t =>
      t.installments.map(inst => ({ ...inst, transaction: t }))
    )

    if (periodFilter === 'all') return allInstallments

    return allInstallments.filter(inst => {
      const dueDate = new Date(inst.dueDate)
      return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear
    })
  }, [transactions, periodFilter, selectedMonth, selectedYear])

  // Counts
  const totalCount = filteredExpenses.length + filteredInstallments.length
  const pendingExpenses = filteredExpenses.filter(e => !e.isPaid).length
  const pendingInstallments = filteredInstallments.filter(i => !i.isPaid).length
  const pendingCount = pendingExpenses + pendingInstallments

  const paidExpenses = filteredExpenses.filter(e => e.isPaid).length
  const paidInstallments = filteredInstallments.filter(i => i.isPaid).length
  const paidCount = paidExpenses + paidInstallments

  const tabs = [
    { value: 'all', label: 'Todas', count: totalCount },
    { value: 'pending', label: 'Pendentes', count: pendingCount },
    { value: 'paid', label: 'Pagas', count: paidCount },
  ]

  function changeMonth(delta: number) {
    let newMonth = selectedMonth + delta
    let newYear = selectedYear

    if (newMonth > 11) {
      newMonth = 0
      newYear++
    } else if (newMonth < 0) {
      newMonth = 11
      newYear--
    }

    setSelectedMonth(newMonth)
    setSelectedYear(newYear)
  }

  // Custom header with period filter
  const periodFilterComponent = (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setPeriodFilter('month')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            periodFilter === 'month'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Por Mes
        </button>
        <button
          onClick={() => setPeriodFilter('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            periodFilter === 'all'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Todas
        </button>
      </div>

      {periodFilter === 'month' && (
        <div className="flex items-center gap-2 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeMonth(-1)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium min-w-[120px] text-center text-gray-700">
            {MONTHS[selectedMonth]} {selectedYear}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeMonth(1)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <CrudLayout
      title="Despesas"
      description="Controle todos os seus gastos"
      totalCount={totalCount}
      tabs={tabs}
      activeTab={statusFilter}
      onTabChange={(value) => setStatusFilter(value as 'all' | 'pending' | 'paid')}
      searchPlaceholder="Buscar despesas..."
      searchValue={searchFilter}
      onSearchChange={setSearchFilter}
      createButtonLabel="Criar Despesa"
      createForm={<AddExpenseForm categories={categories} cards={cards} />}
      accentColor="#F97316"
      extraFilters={periodFilterComponent}
    >
      <ExpenseTable
        expenses={filteredExpenses}
        transactions={transactions}
        searchFilter={searchFilter}
        statusFilter={statusFilter}
        periodFilter={periodFilter}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </CrudLayout>
  )
}
