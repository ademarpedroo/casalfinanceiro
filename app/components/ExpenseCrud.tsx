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

interface ExpenseCrudProps {
  expenses: Expense[]
  categories: Category[]
}

export default function ExpenseCrud({ expenses, categories }: ExpenseCrudProps) {
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all')

  const pendingCount = expenses.filter(e => !e.isPaid).length
  const paidCount = expenses.filter(e => e.isPaid).length

  const tabs = [
    { value: 'all', label: 'Todas', count: expenses.length },
    { value: 'pending', label: 'Pendentes', count: pendingCount },
    { value: 'paid', label: 'Pagas', count: paidCount },
  ]

  return (
    <CrudLayout
      title="Despesas"
      description="Controle todos os seus gastos mensais"
      totalCount={expenses.length}
      tabs={tabs}
      activeTab={statusFilter}
      onTabChange={(value) => setStatusFilter(value as 'all' | 'pending' | 'paid')}
      searchPlaceholder="Buscar despesas..."
      searchValue={searchFilter}
      onSearchChange={setSearchFilter}
      createButtonLabel="Criar Despesa"
      createForm={<AddExpenseForm categories={categories} />}
      accentColor="#F97316"
    >
      <ExpenseTable
        expenses={expenses}
        searchFilter={searchFilter}
        statusFilter={statusFilter}
      />
    </CrudLayout>
  )
}
