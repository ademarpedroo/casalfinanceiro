'use client'

import { useState } from 'react'
import { deleteExpense, markExpenseAsPaid } from '@/app/actions/expenses'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Calendar, Check, TrendingDown, Clock } from 'lucide-react'
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export default function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleMarkPaid(id: string) {
    setLoadingId(id)
    const result = await markExpenseAsPaid(id)
    if (result?.success) {
      setToast({ message: result.message!, type: 'success' })
    } else {
      setToast({ message: result?.error || 'Erro', type: 'error' })
    }
    setLoadingId(null)
  }

  async function handleDelete(id: string, description: string) {
    if (confirm(`Excluir "${description}"?`)) {
      setLoadingId(id)
      const result = await deleteExpense(id)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
      setLoadingId(null)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-3">
          <TrendingDown className="w-7 h-7 text-orange-500" />
        </div>
        <p className="text-gray-500">Nenhuma despesa registrada</p>
        <p className="text-gray-400 text-sm mt-1">Use o botão + para adicionar</p>
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

      <div className="space-y-2">
        {expenses.map((exp) => (
          <Card
            key={exp.id}
            className={`p-3 transition-all hover:shadow-md border-l-4 ${
              exp.isPaid
                ? 'border-l-gray-300 opacity-60'
                : 'border-l-orange-500'
            } ${loadingId === exp.id ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className={`font-semibold truncate ${
                    exp.isPaid ? 'text-gray-500 line-through' : 'text-gray-800'
                  }`}>
                    {exp.description}
                  </h3>
                  {exp.category && (
                    <Badge
                      variant="secondary"
                      className="text-xs shrink-0"
                      style={{
                        backgroundColor: `${exp.category.color}15`,
                        color: exp.category.color,
                      }}
                    >
                      {exp.category.icon} {exp.category.name}
                    </Badge>
                  )}
                  {exp.isFixed && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      <Clock className="w-3 h-3 mr-1" />
                      Fixo
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Vence {formatDate(exp.dueDate)}
                </p>
              </div>

              {/* Valor e Ações */}
              <div className="flex items-center gap-2 ml-3">
                <span className={`font-bold text-lg ${
                  exp.isPaid ? 'text-gray-400' : 'text-orange-600'
                }`}>
                  {formatCurrency(exp.amount)}
                </span>

                {!exp.isPaid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkPaid(exp.id)}
                    disabled={loadingId === exp.id}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Marcar como pago"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(exp.id, exp.description)}
                  disabled={loadingId === exp.id}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
