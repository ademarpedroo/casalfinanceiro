'use client'

import { useState } from 'react'
import CrudLayout from './CrudLayout'
import IncomeTable from './IncomeTable'
import AddIncomeForm from './AddIncomeForm'

interface Income {
  id: string
  description: string
  amount: number
  date: Date
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

interface IncomeCrudProps {
  incomes: Income[]
  categories: Category[]
}

export default function IncomeCrud({ incomes, categories }: IncomeCrudProps) {
  const [searchFilter, setSearchFilter] = useState('')

  const tabs = [
    { value: 'all', label: 'Todas', count: incomes.length },
  ]

  return (
    <CrudLayout
      title="Receitas"
      description="Gerencie todas as suas receitas mensais"
      totalCount={incomes.length}
      tabs={tabs}
      activeTab="all"
      searchPlaceholder="Buscar receitas..."
      searchValue={searchFilter}
      onSearchChange={setSearchFilter}
      createButtonLabel="Criar Receita"
      createForm={<AddIncomeForm categories={categories} />}
      accentColor="#10B981"
    >
      <IncomeTable incomes={incomes} searchFilter={searchFilter} />
    </CrudLayout>
  )
}
