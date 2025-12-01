'use client'

import { deleteExpense } from '@/app/actions/expenses'
import MarkPaidButton from './MarkPaidButton'

interface Expense {
  id: string
  description: string
  amount: number
  dueDate: Date
  category?: {
    name: string
    color: string
    icon: string | null
  } | null
}

export default function ExpenseList({ expenses }: { expenses: Expense[] }) {
  async function handleDelete(id: string, description: string) {
    if (confirm(`Tem certeza que deseja excluir a despesa "${description}"?`)) {
      await deleteExpense(id)
    }
  }

  if (expenses.length === 0) {
    return <p className="text-gray-500">Nenhuma conta registrada.</p>
  }

  return (
    <div className="space-y-3">
      {expenses.map((exp) => (
        <div key={exp.id} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{exp.description}</p>
              {exp.category && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: exp.category.color }}
                >
                  {exp.category.icon} {exp.category.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">Vence: {new Date(exp.dueDate).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600">R$ {exp.amount.toFixed(2)}</span>
            <MarkPaidButton id={exp.id} />
            <button
              onClick={() => handleDelete(exp.id, exp.description)}
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
