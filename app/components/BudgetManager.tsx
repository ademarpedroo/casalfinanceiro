'use client'

import { createBudget, deleteBudget } from '@/app/actions/budget'
import { useState } from 'react'

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
  const [isAdding, setIsAdding] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createBudget(formData)
    e.currentTarget.reset()
    setIsAdding(false)
  }

  async function handleDelete(id: string, categoryName: string) {
    if (confirm(`Tem certeza que deseja excluir o orçamento de "${categoryName}"?`)) {
      await deleteBudget(id)
    }
  }

  function getProgressColor(percentage: number) {
    if (percentage < 70) return 'bg-green-500'
    if (percentage < 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Orçamento - {monthNames[currentMonth - 1]} {currentYear}
        </h2>
        {availableCategories.length > 0 && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isAdding ? 'Cancelar' : 'Novo Orçamento'}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded">
          <input type="hidden" name="month" value={currentMonth} />
          <input type="hidden" name="year" value={currentYear} />

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <select name="categoryId" required className="w-full p-2 border rounded">
                <option value="">Selecione uma categoria</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Limite (R$)</label>
              <input
                type="number"
                name="limit"
                step="0.01"
                required
                className="w-full p-2 border rounded"
                placeholder="500.00"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Criar Orçamento
            </button>
          </div>
        </form>
      )}

      {budgets.length === 0 ? (
        <p className="text-gray-500">Nenhum orçamento definido para este mês.</p>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {budget.category.icon && (
                    <span className="text-2xl">{budget.category.icon}</span>
                  )}
                  <div>
                    <h3 className="font-semibold">{budget.category.name}</h3>
                    <p className="text-sm text-gray-600">
                      Gasto: R$ {budget.spent.toFixed(2)} / Limite: R$ {budget.limit.toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(budget.id, budget.category.name)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Excluir
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(budget.percentage)} transition-all`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className={budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {budget.remaining >= 0 ? 'Restam' : 'Excedeu'}: R${' '}
                  {Math.abs(budget.remaining).toFixed(2)}
                </span>
                <span className="font-semibold">{budget.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {availableCategories.length === 0 && budgets.length > 0 && (
        <p className="text-sm text-gray-500 mt-4">
          Todas as categorias de despesa já possuem orçamento para este mês.
        </p>
      )}
    </div>
  )
}
