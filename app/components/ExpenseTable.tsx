'use client'

import { useState, useTransition } from 'react'
import { deleteExpense, markExpenseAsPaid, updateExpense } from '@/app/actions/expenses'
import { markInstallmentAsPaid, markInstallmentAsUnpaid, deleteTransaction } from '@/app/actions/cards'
import { Trash2, TrendingDown, Calendar, Check, CreditCard, Clock, Loader2, Pencil, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import PartnerBadge from './PartnerBadge'

interface Category {
  id: string
  name: string
  color: string
  icon: string | null
  type: string
}

interface Expense {
  id: string
  description: string
  amount: number
  dueDate: Date
  isPaid?: boolean
  isFixed?: boolean
  categoryId?: string | null
  category?: {
    id: string
    name: string
    color: string
    icon: string | null
  } | null
  user?: {
    id: string
    name: string | null
    image: string | null
  }
}

interface Transaction {
  id: string
  cardId: string
  description: string
  totalAmount: number
  purchaseDate: Date
  installmentsCount: number
  card: {
    id: string
    name: string
    color: string
  }
  installments: Installment[]
}

interface Installment {
  id: string
  transactionId: string
  number: number
  amount: number
  dueDate: Date
  isPaid: boolean
}

const CARD_COLORS: Record<string, string> = {
  nubank: '#820AD1',
  inter: '#FF7A00',
  c6blue: '#1F51AC',
  black: '#1A1A1A',
  platinum: '#71717A',
  gold: '#D4AF37',
  red: '#D32F2F',
  graphite: '#424242',
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

// Tipo unificado para exibicao
interface UnifiedExpense {
  id: string
  description: string
  amount: number
  dueDate: Date
  isPaid: boolean
  isFixed?: boolean
  category?: {
    name: string
    color: string
    icon: string | null
  } | null
  isCardExpense: boolean
  cardName?: string
  cardColor?: string
  installmentNumber?: number
  installmentsCount?: number
  transactionId?: string
  installmentId?: string
  user?: {
    id: string
    name: string | null
    image: string | null
  }
}

interface ExpenseTableProps {
  expenses: Expense[]
  transactions?: Transaction[]
  categories?: Category[]
  searchFilter?: string
  statusFilter?: 'all' | 'pending' | 'paid'
  periodFilter?: 'all' | 'month'
  selectedMonth?: number
  selectedYear?: number
  currentUserId?: string
}

export default function ExpenseTable({
  expenses,
  transactions = [],
  categories = [],
  searchFilter = '',
  statusFilter = 'all',
  periodFilter = 'month',
  selectedMonth,
  selectedYear,
  currentUserId = '',
}: ExpenseTableProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<UnifiedExpense | null>(null)

  // Edit states
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(undefined)
  const [editCategory, setEditCategory] = useState('')
  const [editIsFixed, setEditIsFixed] = useState(false)

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

  // Get installments from transactions (filtered by period if needed)
  const cardInstallments: UnifiedExpense[] = transactions.flatMap(t =>
    t.installments
      .filter(inst => {
        if (periodFilter === 'all') return true
        if (selectedMonth === undefined || selectedYear === undefined) return true
        const dueDate = new Date(inst.dueDate)
        return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear
      })
      .map(inst => ({
        id: `card-${inst.id}`,
        description: t.description,
        amount: inst.amount,
        dueDate: new Date(inst.dueDate),
        isPaid: inst.isPaid,
        isCardExpense: true,
        cardName: t.card.name,
        cardColor: t.card.color,
        installmentNumber: inst.number,
        installmentsCount: t.installmentsCount,
        transactionId: t.id,
        installmentId: inst.id,
      }))
  )

  // Convert regular expenses to unified format
  const regularExpenses: UnifiedExpense[] = expenses.map(exp => ({
    id: exp.id,
    description: exp.description,
    amount: exp.amount,
    dueDate: new Date(exp.dueDate),
    isPaid: exp.isPaid || false,
    isFixed: exp.isFixed,
    category: exp.category,
    isCardExpense: false,
    user: exp.user,
  }))

  // Combine and filter
  let allExpenses = [...regularExpenses, ...cardInstallments]

  allExpenses = allExpenses.filter(exp =>
    exp.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    exp.category?.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    exp.cardName?.toLowerCase().includes(searchFilter.toLowerCase())
  )

  if (statusFilter === 'pending') {
    allExpenses = allExpenses.filter(exp => !exp.isPaid)
  } else if (statusFilter === 'paid') {
    allExpenses = allExpenses.filter(exp => exp.isPaid)
  }

  const sortedExpenses = [...allExpenses].sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  // Find the original expense for editing (only for regular expenses, not card installments)
  function openEditModal(exp: UnifiedExpense) {
    if (exp.isCardExpense) return // Don't allow editing card installments here
    const originalExpense = expenses.find(e => e.id === exp.id)
    if (!originalExpense) return

    setEditingExpense(originalExpense)
    setEditDescription(originalExpense.description)
    setEditAmount(originalExpense.amount.toString())
    setEditDueDate(new Date(originalExpense.dueDate))
    setEditCategory(originalExpense.categoryId || '')
    setEditIsFixed(originalExpense.isFixed || false)
  }

  async function handleEditSave() {
    if (!editingExpense || !editDueDate) return

    startTransition(async () => {
      const formData = new FormData()
      formData.set('description', editDescription)
      formData.set('amount', editAmount)
      formData.set('dueDate', editDueDate.toISOString())
      formData.set('isFixed', editIsFixed ? 'true' : 'false')
      if (editCategory && editCategory !== '_none') {
        formData.set('categoryId', editCategory)
      }

      const result = await updateExpense(editingExpense.id, formData)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        setEditingExpense(null)
      } else {
        setToast({ message: result?.error || 'Erro ao atualizar', type: 'error' })
      }
    })
  }

  async function handleMarkPaid(exp: UnifiedExpense) {
    setLoadingId(exp.id)

    if (exp.isCardExpense && exp.installmentId) {
      const result = exp.isPaid
        ? await markInstallmentAsUnpaid(exp.installmentId)
        : await markInstallmentAsPaid(exp.installmentId)

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro', type: 'error' })
      }
    } else {
      const result = await markExpenseAsPaid(exp.id)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro', type: 'error' })
      }
    }

    setLoadingId(null)
  }

  async function handleDelete() {
    if (!deleteModal) return
    setLoadingId(deleteModal.id)

    if (deleteModal.isCardExpense && deleteModal.transactionId) {
      const result = await deleteTransaction(deleteModal.transactionId)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
    } else {
      const result = await deleteExpense(deleteModal.id)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
    }

    setLoadingId(null)
    setDeleteModal(null)
  }

  if (sortedExpenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
          <TrendingDown className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma despesa encontrada</h3>
        <p className="text-gray-500">
          {searchFilter ? 'Tente outro termo de busca' : 'Clique em "Criar Despesa" para adicionar'}
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
        title={deleteModal?.isCardExpense ? 'Excluir compra' : 'Excluir despesa'}
        description={
          deleteModal?.isCardExpense
            ? `Tem certeza que deseja excluir "${deleteModal?.description}"? Todas as parcelas serao removidas.`
            : `Tem certeza que deseja excluir "${deleteModal?.description}"? Esta acao nao pode ser desfeita.`
        }
        isLoading={!!loadingId}
      />

      {/* Edit Modal */}
      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-orange-500" />
              Editar Despesa
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Descricao */}
            <div className="space-y-2">
              <Label htmlFor="edit-expense-description">Descricao</Label>
              <Input
                id="edit-expense-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Ex: Conta de luz, Mercado..."
                disabled={isPending}
                className="h-11"
              />
            </div>

            {/* Valor e Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-expense-amount">Valor (R$)</Label>
                <Input
                  id="edit-expense-amount"
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
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon || '📁'}</span>
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
              <Label>Data de Vencimento</Label>
              <DatePicker
                date={editDueDate}
                onDateChange={setEditDueDate}
                placeholder="Selecione a data"
              />
            </div>

            {/* Conta Fixa */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="edit-isFixed"
                checked={editIsFixed}
                onCheckedChange={(checked) => setEditIsFixed(checked as boolean)}
                disabled={isPending}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <Label htmlFor="edit-isFixed" className="text-sm font-medium cursor-pointer text-gray-700">
                  Conta fixa mensal
                </Label>
              </div>
            </div>

            {/* Botoes */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingExpense(null)}
                disabled={isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleEditSave}
                disabled={isPending || !editDescription || !editAmount || !editDueDate}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
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
        {sortedExpenses.map((exp) => (
          <div
            key={exp.id}
            className={`group flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
              loadingId === exp.id ? 'opacity-50' : ''
            } ${exp.isPaid ? 'bg-gray-50/50' : ''}`}
          >
            {/* Left side - Info */}
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  exp.isPaid ? 'opacity-50' : ''
                }`}
                style={{
                  backgroundColor: exp.isCardExpense
                    ? `${CARD_COLORS[exp.cardColor || ''] || '#6366f1'}15`
                    : exp.category?.color
                    ? `${exp.category.color}15`
                    : '#f9731615',
                }}
              >
                {exp.isCardExpense ? (
                  <CreditCard
                    className="w-6 h-6"
                    style={{ color: CARD_COLORS[exp.cardColor || ''] || '#6366f1' }}
                  />
                ) : (
                  exp.category?.icon || '💸'
                )}
              </div>

              {/* Details */}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold ${exp.isPaid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {exp.description}
                  </h4>
                  {exp.isCardExpense && exp.installmentNumber && exp.installmentsCount && (
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {exp.installmentNumber}/{exp.installmentsCount}
                    </span>
                  )}
                  {exp.isFixed && (
                    <span className="flex items-center text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                      <Clock className="w-3 h-3 mr-0.5" />
                      Fixo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {exp.isCardExpense ? (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${CARD_COLORS[exp.cardColor || ''] || '#6366f1'}15`,
                        color: CARD_COLORS[exp.cardColor || ''] || '#6366f1',
                      }}
                    >
                      {exp.cardName}
                    </span>
                  ) : exp.category && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${exp.category.color}15`,
                        color: exp.category.color,
                      }}
                    >
                      {exp.category.name}
                    </span>
                  )}
                  <span className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(exp.dueDate)}
                  </span>
                  {exp.isPaid && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      Pago
                    </span>
                  )}
                  {exp.user && currentUserId && (
                    <PartnerBadge user={exp.user} currentUserId={currentUserId} />
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Amount and actions */}
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${
                exp.isPaid ? 'text-gray-400' : exp.isCardExpense ? 'text-indigo-600' : 'text-orange-600'
              }`}>
                {formatCurrency(exp.amount)}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                {/* Edit button (only for regular expenses, not card installments) */}
                {!exp.isCardExpense && (
                  <button
                    onClick={() => openEditModal(exp)}
                    disabled={loadingId === exp.id}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                    title="Editar despesa"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}

                {/* Mark as paid button */}
                <button
                  onClick={() => handleMarkPaid(exp)}
                  disabled={loadingId === exp.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    exp.isPaid
                      ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={exp.isPaid ? 'Desmarcar pagamento' : 'Marcar como pago'}
                >
                  {loadingId === exp.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>

                {/* Delete button */}
                <button
                  onClick={() => setDeleteModal(exp)}
                  disabled={loadingId === exp.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title={exp.isCardExpense ? 'Excluir compra (todas parcelas)' : 'Excluir'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
