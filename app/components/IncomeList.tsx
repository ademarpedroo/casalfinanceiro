'use client'

import { deleteIncome } from '@/app/actions/income'
import { useState } from 'react'

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

export default function IncomeList({ incomes }: { incomes: Income[] }) {
  async function handleDelete(id: string, description: string) {
    if (confirm(`Tem certeza que deseja excluir a receita "${description}"?`)) {
      await deleteIncome(id)
    }
  }

  if (incomes.length === 0) {
    return <p className="text-gray-500">Nenhuma receita registrada.</p>
  }

  return (
    <div className="space-y-3">
      {incomes.map((inc) => (
        <div key={inc.id} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{inc.description}</p>
              {inc.category && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: inc.category.color }}
                >
                  {inc.category.icon} {inc.category.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{new Date(inc.date).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-green-600">R$ {inc.amount.toFixed(2)}</span>
            <button
              onClick={() => handleDelete(inc.id, inc.description)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
