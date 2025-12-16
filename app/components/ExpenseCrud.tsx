'use client'

import { useState } from 'react'
import CrudLayout from './CrudLayout'
import ExpenseTable from './ExpenseTable'
import AddExpenseForm from './AddExpenseForm'

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

export default function ExpenseCrud({ expenses, categories, cards = [], transactions = [] }: ExpenseCrudProps) {
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all')

  // Get current month's installments for counting
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const currentMonthInstallments = transactions.flatMap(t =>
    t.installments.filter(inst => {
      const dueDate = new Date(inst.dueDate)
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear
    })
  )

  const totalCount = expenses.length + currentMonthInstallments.length
  const pendingExpenses = expenses.filter(e => !e.isPaid).length
  const pendingInstallments = currentMonthInstallments.filter(i => !i.isPaid).length
  const pendingCount = pendingExpenses + pendingInstallments

  const paidExpenses = expenses.filter(e => e.isPaid).length
  const paidInstallments = currentMonthInstallments.filter(i => i.isPaid).length
  const paidCount = paidExpenses + paidInstallments

  const tabs = [
    { value: 'all', label: 'Todas', count: totalCount },
    { value: 'pending', label: 'Pendentes', count: pendingCount },
    { value: 'paid', label: 'Pagas', count: paidCount },
  ]

  return (
    <CrudLayout
      title="Despesas"
      description="Controle todos os seus gastos mensais"
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
    >
      <ExpenseTable
        expenses={expenses}
        transactions={transactions}
        searchFilter={searchFilter}
        statusFilter={statusFilter}
      />
    </CrudLayout>
  )
}
