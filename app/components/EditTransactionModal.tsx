'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { updateTransaction } from '@/app/actions/cards'
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
import { Calendar, CheckCircle2, Clock, Loader2, Save, CreditCard, Pencil } from 'lucide-react'
import { addMonths, setDate } from 'date-fns'
import Toast from './Toast'

interface Category {
  id: string
  name: string
  color: string
  icon: string | null
  type: string
}

interface Transaction {
  id: string
  description: string
  totalAmount: number
  purchaseDate: Date
  installmentsCount: number
  categoryId?: string | null
  category?: Category | null
  card: {
    id: string
    name: string
    color: string
    dueDay: number
  }
  installments: {
    id: string
    number: number
    amount: number
    dueDate: Date
    isPaid: boolean
  }[]
}

interface EditTransactionModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  categories?: Category[]
}

const CARD_COLORS: Record<string, string> = {
  nubank: '#820AD1',
  inter: '#FF7A00',
  c6blue: '#1F51AC',
  black: '#1A1A1A',
  platinum: '#C0C0C0',
  gold: '#D4AF37',
  red: '#D32F2F',
  graphite: '#424242',
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function EditTransactionModal({ transaction, isOpen, onClose, categories = [] }: EditTransactionModalProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Form states
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [installmentsCount, setInstallmentsCount] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [firstInvoiceDate, setFirstInvoiceDate] = useState<Date | undefined>(undefined)
  const [paidInstallments, setPaidInstallments] = useState<number>(0)

  // Atualiza estados quando a transacao muda ou modal abre
  useEffect(() => {
    if (transaction && isOpen) {
      setDescription(transaction.description)
      setTotalAmount(transaction.totalAmount.toString())
      setInstallmentsCount(transaction.installmentsCount)
      setSelectedCategory(transaction.categoryId || '')

      // Detecta a primeira fatura atual baseado na primeira parcela
      if (transaction.installments.length > 0) {
        const firstInstallment = transaction.installments[0]
        setFirstInvoiceDate(new Date(firstInstallment.dueDate))
      }
      // Conta parcelas ja pagas
      const paidCount = transaction.installments.filter(i => i.isPaid).length
      setPaidInstallments(paidCount)
    }
  }, [transaction, isOpen])

  // Preview das parcelas
  const installmentsPreview = useMemo(() => {
    if (!transaction || !firstInvoiceDate || !totalAmount) return []

    const amount = parseFloat(totalAmount) || 0
    const firstDueDate = setDate(firstInvoiceDate, transaction.card.dueDay)

    const preview: { number: number; month: string; year: number; amount: number; isPaid: boolean; dueDate: Date }[] = []

    for (let i = 0; i < installmentsCount; i++) {
      const dueDate = addMonths(firstDueDate, i)
      preview.push({
        number: i + 1,
        month: MONTHS[dueDate.getMonth()],
        year: dueDate.getFullYear(),
        amount: amount / installmentsCount,
        isPaid: i < paidInstallments,
        dueDate
      })
    }

    return preview
  }, [transaction, firstInvoiceDate, paidInstallments, totalAmount, installmentsCount])

  const pendingInstallments = installmentsCount - paidInstallments
  const pendingAmount = totalAmount ? (parseFloat(totalAmount) / installmentsCount) * pendingInstallments : 0

  async function handleSave() {
    if (!transaction || !firstInvoiceDate) return

    startTransition(async () => {
      const result = await updateTransaction(transaction.id, {
        description,
        totalAmount: parseFloat(totalAmount),
        installmentsCount,
        categoryId: selectedCategory && selectedCategory !== '_none' ? selectedCategory : null,
        firstInvoiceMonth: firstInvoiceDate.getMonth(),
        firstInvoiceYear: firstInvoiceDate.getFullYear(),
        paidInstallmentsCount: paidInstallments
      })

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        setToast({ message: result?.error || 'Erro ao atualizar', type: 'error' })
      }
    })
  }

  if (!transaction) return null

  // Filter categories to only show expense type
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-500" />
              Editar Compra
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Info do cartao */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              <div
                className="w-10 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: CARD_COLORS[transaction.card.color] || '#820AD1' }}
              >
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-700">{transaction.card.name}</span>
            </div>

            {/* Descricao */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descricao</Label>
              <Input
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Supermercado, Amazon..."
                disabled={isPending}
                className="h-11"
              />
            </div>

            {/* Valor Total e Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Valor Total (R$)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0,00"
                  disabled={isPending}
                  className="h-11 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

            {/* Parcelas */}
            <div className="space-y-2">
              <Label>Numero de Parcelas</Label>
              <div className="flex flex-wrap gap-2">
                {INSTALLMENT_OPTIONS.map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setInstallmentsCount(num)
                      if (paidInstallments >= num) {
                        setPaidInstallments(Math.max(0, num - 1))
                      }
                    }}
                    disabled={isPending}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      installmentsCount === num
                        ? 'bg-blue-500 text-white scale-105 shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>
              {installmentsCount > 12 && (
                <div className="flex items-center gap-2 mt-2">
                  <Label className="text-sm">Mais parcelas:</Label>
                  <Input
                    type="number"
                    min="1"
                    max="48"
                    value={installmentsCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      setInstallmentsCount(Math.min(48, Math.max(1, val)))
                    }}
                    className="w-20 h-9"
                  />
                </div>
              )}
            </div>

            {/* Selecionar primeira fatura com DatePicker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Primeira fatura (inicio das parcelas)</Label>
              <DatePicker
                date={firstInvoiceDate}
                onDateChange={setFirstInvoiceDate}
                placeholder="Selecione a data da primeira fatura"
              />
              <p className="text-xs text-gray-500">
                Escolha a data de vencimento da primeira parcela
              </p>
            </div>

            {/* Parcelas ja pagas */}
            {installmentsCount > 1 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Parcelas ja pagas</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={installmentsCount - 1}
                    value={paidInstallments}
                    onChange={(e) => setPaidInstallments(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="w-20 text-center font-semibold text-sm bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg">
                    {paidInstallments}/{installmentsCount}
                  </span>
                </div>
                {paidInstallments > 0 && totalAmount && (
                  <p className="text-xs text-emerald-600">
                    {paidInstallments} parcela{paidInstallments > 1 ? 's' : ''} ja paga{paidInstallments > 1 ? 's' : ''} ({formatCurrency((parseFloat(totalAmount) / installmentsCount) * paidInstallments)})
                  </p>
                )}
              </div>
            )}

            {/* Preview das parcelas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview das parcelas</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                <div className="divide-y divide-gray-100">
                  {installmentsPreview.map((inst) => (
                    <div
                      key={inst.number}
                      className={`flex items-center justify-between px-3 py-2 text-sm ${
                        inst.isPaid ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {inst.isPaid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`font-mono ${inst.isPaid ? 'text-emerald-700' : 'text-gray-700'}`}>
                          {inst.number}/{installmentsCount}
                        </span>
                        <span className={inst.isPaid ? 'text-emerald-600' : 'text-gray-500'}>
                          {inst.month} {inst.year}
                        </span>
                      </div>
                      <span className={`font-medium ${inst.isPaid ? 'text-emerald-600 line-through' : 'text-gray-900'}`}>
                        {formatCurrency(inst.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumo */}
            {paidInstallments > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Restante a pagar</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-700">{pendingInstallments}x</span>
                    <span className="text-sm text-blue-600 ml-2">{formatCurrency(pendingAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Botoes */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isPending || !firstInvoiceDate || !description || !totalAmount}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
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
    </>
  )
}
