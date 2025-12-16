'use client'

import { useState, useTransition } from 'react'
import { deleteIncome, updateIncome } from '@/app/actions/income'
import { Trash2, TrendingUp, Calendar, Loader2, Pencil, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Toast from './Toast'
import ConfirmModal from './ConfirmModal'

interface Category {
  id: string
  name: string
  color: string
  icon: string | null
  type: string
}

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
  categories?: Category[]
  searchFilter?: string
}

export default function IncomeTable({ incomes, categories = [], searchFilter = '' }: IncomeTableProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ id: string; description: string } | null>(null)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)

  // Edit form states
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState<Date | undefined>(undefined)
  const [editCategory, setEditCategory] = useState('')

  const incomeCategories = categories.filter(c => c.type === 'INCOME')

  const filteredIncomes = incomes.filter(inc =>
    inc.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    inc.category?.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const sortedIncomes = [...filteredIncomes].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  function openEditModal(income: Income) {
    setEditingIncome(income)
    setEditDescription(income.description)
    setEditAmount(income.amount.toString())
    setEditDate(new Date(income.date))
    setEditCategory(income.categoryId || '')
  }

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

  async function handleEditSave() {
    if (!editingIncome || !editDate) return

    startTransition(async () => {
      const formData = new FormData()
      formData.set('description', editDescription)
      formData.set('amount', editAmount)
      formData.set('date', editDate.toISOString())
      if (editCategory && editCategory !== '_none') {
        formData.set('categoryId', editCategory)
      }

      const result = await updateIncome(editingIncome.id, formData)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        setEditingIncome(null)
      } else {
        setToast({ message: result?.error || 'Erro ao atualizar', type: 'error' })
      }
    })
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

      {/* Edit Modal */}
      <Dialog open={!!editingIncome} onOpenChange={(open) => !open && setEditingIncome(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-emerald-500" />
              Editar Receita
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Descricao */}
            <div className="space-y-2">
              <Label htmlFor="edit-income-description">Descricao</Label>
              <Input
                id="edit-income-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Ex: Salario, Freelance..."
                disabled={isPending}
                className="h-11"
              />
            </div>

            {/* Valor e Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-income-amount">Valor (R$)</Label>
                <Input
                  id="edit-income-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="0,00"
                  disabled={isPending}
                  className="h-11 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sem categoria</SelectItem>
                    {incomeCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon || '💰'}</span>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label>Data</Label>
              <DatePicker
                date={editDate}
                onDateChange={setEditDate}
                placeholder="Selecione a data"
              />
            </div>

            {/* Botoes */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingIncome(null)}
                disabled={isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleEditSave}
                disabled={isPending || !editDescription || !editAmount || !editDate}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alteracoes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(inc)}
                  disabled={loadingId === inc.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Pencil className="h-4 w-4" />
                </button>

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
          </div>
        ))}
      </div>
    </>
  )
}
