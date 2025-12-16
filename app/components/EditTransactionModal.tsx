'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { updateTransactionInvoice } from '@/app/actions/cards'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, CheckCircle2, Clock, Loader2, Save, CreditCard } from 'lucide-react'
import { addMonths, setDate } from 'date-fns'
import Toast from './Toast'

interface Transaction {
  id: string
  description: string
  totalAmount: number
  purchaseDate: Date
  installmentsCount: number
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function EditTransactionModal({ transaction, isOpen, onClose }: EditTransactionModalProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [firstInvoiceDate, setFirstInvoiceDate] = useState<Date | undefined>(undefined)
  const [paidInstallments, setPaidInstallments] = useState<number>(0)

  // Atualiza estados quando a transacao muda ou modal abre
  useEffect(() => {
    if (transaction && isOpen) {
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
    if (!transaction || !firstInvoiceDate) return []

    const firstDueDate = setDate(firstInvoiceDate, transaction.card.dueDay)

    const preview: { number: number; month: string; year: number; amount: number; isPaid: boolean; dueDate: Date }[] = []

    for (let i = 0; i < transaction.installmentsCount; i++) {
      const dueDate = addMonths(firstDueDate, i)
      preview.push({
        number: i + 1,
        month: MONTHS[dueDate.getMonth()],
        year: dueDate.getFullYear(),
        amount: transaction.installments[i]?.amount || transaction.totalAmount / transaction.installmentsCount,
        isPaid: i < paidInstallments,
        dueDate
      })
    }

    return preview
  }, [transaction, firstInvoiceDate, paidInstallments])

  const pendingInstallments = transaction ? transaction.installmentsCount - paidInstallments : 0
  const pendingAmount = transaction ? (transaction.totalAmount / transaction.installmentsCount) * pendingInstallments : 0

  async function handleSave() {
    if (!transaction || !firstInvoiceDate) return

    startTransition(async () => {
      const result = await updateTransactionInvoice(
        transaction.id,
        firstInvoiceDate.getMonth(),
        firstInvoiceDate.getFullYear(),
        paidInstallments
      )

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
              <Calendar className="w-5 h-5 text-blue-500" />
              Ajustar Parcelas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Info da compra */}
            <div className="p-4 bg-gray-50 rounded-xl border">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: CARD_COLORS[transaction.card.color] || '#820AD1' }}
                >
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                  <p className="text-sm text-gray-500">{transaction.card.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-lg p-2 border">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(transaction.totalAmount)}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border">
                  <p className="text-xs text-gray-500">Parcelas</p>
                  <p className="font-semibold text-gray-900">{transaction.installmentsCount}x</p>
                </div>
                <div className="bg-white rounded-lg p-2 border">
                  <p className="text-xs text-gray-500">Por Parcela</p>
                  <p className="font-semibold text-blue-600">
                    {formatCurrency(transaction.totalAmount / transaction.installmentsCount)}
                  </p>
                </div>
              </div>
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
            {transaction.installmentsCount > 1 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Parcelas ja pagas</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={transaction.installmentsCount - 1}
                    value={paidInstallments}
                    onChange={(e) => setPaidInstallments(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="w-20 text-center font-semibold text-sm bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg">
                    {paidInstallments}/{transaction.installmentsCount}
                  </span>
                </div>
                {paidInstallments > 0 && (
                  <p className="text-xs text-emerald-600">
                    {paidInstallments} parcela{paidInstallments > 1 ? 's' : ''} ja paga{paidInstallments > 1 ? 's' : ''} ({formatCurrency((transaction.totalAmount / transaction.installmentsCount) * paidInstallments)})
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
                          {inst.number}/{transaction.installmentsCount}
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
                disabled={isPending || !firstInvoiceDate}
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
