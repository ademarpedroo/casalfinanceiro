'use client'

import { useState } from 'react'
import { deleteIncome } from '@/app/actions/income'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Calendar, TrendingUp } from 'lucide-react'
import Toast from './Toast'

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

export default function IncomeList({ incomes }: { incomes: Income[] }) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleDelete(id: string, description: string) {
    if (confirm(`Excluir "${description}"?`)) {
      setLoadingId(id)
      const result = await deleteIncome(id)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
      setLoadingId(null)
    }
  }

  if (incomes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-3">
          <TrendingUp className="w-7 h-7 text-green-500" />
        </div>
        <p className="text-gray-500">Nenhuma receita registrada</p>
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
        {incomes.map((inc) => (
          <Card
            key={inc.id}
            className={`p-3 transition-all hover:shadow-md border-l-4 border-l-green-500 ${
              loadingId === inc.id ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {inc.description}
                  </h3>
                  {inc.category && (
                    <Badge
                      variant="secondary"
                      className="text-xs shrink-0"
                      style={{
                        backgroundColor: `${inc.category.color}15`,
                        color: inc.category.color,
                      }}
                    >
                      {inc.category.icon} {inc.category.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(inc.date)}
                </p>
              </div>

              {/* Valor e Ação */}
              <div className="flex items-center gap-3 ml-3">
                <span className="font-bold text-green-600 text-lg">
                  {formatCurrency(inc.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(inc.id, inc.description)}
                  disabled={loadingId === inc.id}
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
