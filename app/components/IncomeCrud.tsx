'use client'

import { useState, useMemo } from 'react'
import CrudLayout from './CrudLayout'
import IncomeTable from './IncomeTable'
import AddIncomeForm from './AddIncomeForm'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Income {
  id: string
  description: string
  amount: number
  date: Date
  categoryId?: string | null
  category?: {
    id: string
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

const MONTHS = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

type PeriodFilter = 'all' | 'month'

export default function IncomeCrud({ incomes, categories }: IncomeCrudProps) {
  const [searchFilter, setSearchFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month')

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  // Filter incomes by period
  const filteredIncomes = useMemo(() => {
    if (periodFilter === 'all') return incomes

    return incomes.filter(inc => {
      const date = new Date(inc.date)
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    })
  }, [incomes, periodFilter, selectedMonth, selectedYear])

  const totalCount = filteredIncomes.length

  const tabs = [
    { value: 'all', label: 'Todas', count: totalCount },
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

  const periodFilterComponent = (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setPeriodFilter('month')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            periodFilter === 'month'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Por Mes
        </button>
        <button
          onClick={() => setPeriodFilter('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            periodFilter === 'all'
              ? 'bg-white text-green-600 shadow-sm'
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
      title="Receitas"
      description="Gerencie todas as suas receitas mensais"
      totalCount={totalCount}
      tabs={tabs}
      activeTab="all"
      searchPlaceholder="Buscar receitas..."
      searchValue={searchFilter}
      onSearchChange={setSearchFilter}
      createButtonLabel="Criar Receita"
      createForm={<AddIncomeForm categories={categories} />}
      accentColor="#10B981"
      extraFilters={periodFilterComponent}
    >
      <IncomeTable incomes={filteredIncomes} categories={categories} searchFilter={searchFilter} />
    </CrudLayout>
  )
}
