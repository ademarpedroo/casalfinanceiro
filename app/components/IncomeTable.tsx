'use client'

import { useState } from 'react'
import { deleteIncome } from '@/app/actions/income'
import { Trash2, TrendingUp, Calendar, Loader2 } from 'lucide-react'
import Toast from './Toast'
import ConfirmModal from './ConfirmModal'

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

interface IncomeTableProps {
  incomes: Income[]
  searchFilter?: string
}

export default function IncomeTable({ incomes, searchFilter = '' }: IncomeTableProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ id: string; description: string } | null>(null)

  const filteredIncomes = incomes.filter(inc =>
    inc.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    inc.category?.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const sortedIncomes = [...filteredIncomes].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  async function handleDelete() {
    if (!deleteModal) return
    setLoadingId(deleteModal.id)
    const result = await deleteIncome(deleteModal.id)
    if (result?.success) {
      setToast({ message: result.message!, type: 'success' })
    } else {
      setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
    }
    setLoadingId(null)
    setDeleteModal(null)
  }

  if (sortedIncomes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <TrendingUp className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma receita encontrada</h3>
        <p className="text-gray-500">
          {searchFilter ? 'Tente outro termo de busca' : 'Clique em "Criar Receita" para adicionar'}
        </p>
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

      <ConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Excluir receita"
        description={`Tem certeza que deseja excluir "${deleteModal?.description}"? Esta acao nao pode ser desfeita.`}
        isLoading={!!loadingId}
      />

      <div className="divide-y divide-gray-100">
        {sortedIncomes.map((inc) => (
          <div
            key={inc.id}
            className={`group flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
              loadingId === inc.id ? 'opacity-50' : ''
            }`}
          >
            {/* Left side - Info */}
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{
                  backgroundColor: inc.category?.color ? `${inc.category.color}15` : '#10b98115',
                }}
              >
                {inc.category?.icon || '💰'}
              </div>

              {/* Details */}
              <div>
                <h4 className="font-semibold text-gray-900">{inc.description}</h4>
                <div className="flex items-center gap-3 mt-1">
                  {inc.category && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${inc.category.color}15`,
                        color: inc.category.color,
                      }}
                    >
                      {inc.category.name}
                    </span>
                  )}
                  <span className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(inc.date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Amount and actions */}
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-emerald-600">
                {formatCurrency(inc.amount)}
              </span>

              <button
                onClick={() => setDeleteModal({ id: inc.id, description: inc.description })}
                disabled={loadingId === inc.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                {loadingId === inc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
