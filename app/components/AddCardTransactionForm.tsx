'use client'

import { createTransaction } from '@/app/actions/cards'
import { useTransition, useState, useMemo } from 'react'
import Toast from './Toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { CreditCard, Loader2, ShoppingCart, Calendar, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { addMonths, setDate, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Card {
  id: string
  name: string
  color: string
  brand: string
  closingDay: number
  dueDay: number
  lastFourDigits?: string | null
}

interface AddCardTransactionFormProps {
  cards: Card[]
  onSuccess?: () => void
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

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// Calcula a primeira fatura baseado na data de compra e dia de fechamento
function calculateFirstInvoice(purchaseDate: Date, closingDay: number, dueDay: number): { month: number; year: number; dueDate: Date } {
  let billingCycleClosingDate = setDate(purchaseDate, closingDay)

  // Se a compra foi DEPOIS do fechamento, vai para a proxima fatura
  if (purchaseDate.getDate() > closingDay) {
    billingCycleClosingDate = addMonths(billingCycleClosingDate, 1)
  }

  // Calcula a data de vencimento
  let firstDueDate = setDate(billingCycleClosingDate, dueDay)

  // Se o dia de vencimento é menor que o de fechamento, o vencimento é no mes seguinte
  if (dueDay < closingDay) {
    firstDueDate = addMonths(firstDueDate, 1)
  }

  return {
    month: firstDueDate.getMonth(),
    year: firstDueDate.getFullYear(),
    dueDate: firstDueDate
  }
}

export default function AddCardTransactionForm({ cards, onSuccess }: AddCardTransactionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCard, setSelectedCard] = useState<string>('')
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [amount, setAmount] = useState<string>('')
  const [paidInstallments, setPaidInstallments] = useState<number>(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customFirstInvoiceDate, setCustomFirstInvoiceDate] = useState<Date | undefined>(undefined)

  const card = cards.find(c => c.id === selectedCard)

  // Calcula a primeira fatura automaticamente ou usa a customizada
  const firstInvoice = useMemo(() => {
    if (!card || !selectedDate) return null

    if (customFirstInvoiceDate) {
      // Usa a fatura customizada baseada na data selecionada
      const dueDate = setDate(customFirstInvoiceDate, card.dueDay)
      return {
        month: customFirstInvoiceDate.getMonth(),
        year: customFirstInvoiceDate.getFullYear(),
        dueDate
      }
    }

    return calculateFirstInvoice(selectedDate, card.closingDay, card.dueDay)
  }, [card, selectedDate, customFirstInvoiceDate])

  // Preview das parcelas
  const installmentsPreview = useMemo(() => {
    if (!firstInvoice || !amount || selectedInstallments < 1) return []

    const installmentAmount = parseFloat(amount) / selectedInstallments
    const preview: { number: number; month: string; year: number; amount: number; isPaid: boolean }[] = []

    for (let i = 0; i < selectedInstallments; i++) {
      const dueDate = addMonths(firstInvoice.dueDate, i)
      preview.push({
        number: i + 1,
        month: MONTHS[dueDate.getMonth()],
        year: dueDate.getFullYear(),
        amount: installmentAmount,
        isPaid: i < paidInstallments
      })
    }

    return preview
  }, [firstInvoice, amount, selectedInstallments, paidInstallments])

  const pendingInstallments = selectedInstallments - paidInstallments
  const pendingAmount = amount ? (parseFloat(amount) / selectedInstallments) * pendingInstallments : 0

  // Verifica se a compra e retroativa (data no passado)
  const isRetroactive = selectedDate && selectedDate < new Date(new Date().setHours(0, 0, 0, 0))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (!selectedCard) {
      setToast({ message: 'Selecione um cartao', type: 'error' })
      return
    }

    if (paidInstallments >= selectedInstallments) {
      setToast({ message: 'Parcelas pagas nao podem ser maior ou igual ao total', type: 'error' })
      return
    }

    formData.set('cardId', selectedCard)
    formData.set('installments', selectedInstallments.toString())
    formData.set('paidInstallments', paidInstallments.toString())

    if (selectedDate) {
      formData.set('purchaseDate', selectedDate.toISOString().split('T')[0])
    }

    // Se tem primeira fatura customizada, envia
    if (customFirstInvoiceDate) {
      formData.set('firstInvoiceMonth', customFirstInvoiceDate.getMonth().toString())
      formData.set('firstInvoiceYear', customFirstInvoiceDate.getFullYear().toString())
    } else if (firstInvoice) {
      formData.set('firstInvoiceMonth', firstInvoice.month.toString())
      formData.set('firstInvoiceYear', firstInvoice.year.toString())
    }

    startTransition(async () => {
      const result = await createTransaction(formData)

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        const form = e.currentTarget as HTMLFormElement
        form?.reset()
        setSelectedCard('')
        setSelectedInstallments(1)
        setSelectedDate(new Date())
        setAmount('')
        setPaidInstallments(0)
        setCustomFirstInvoiceDate(undefined)
        setShowAdvanced(false)
        onSuccess?.()
      } else {
        setToast({ message: result?.error || 'Erro desconhecido', type: 'error' })
      }
    })
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cartao */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Cartao</Label>
          {cards.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
              Nenhum cartao cadastrado. Cadastre um cartao primeiro.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {cards.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCard(selectedCard === c.id ? '' : c.id)
                    setCustomFirstInvoiceDate(undefined) // Reset quando troca de cartao
                  }}
                  disabled={isPending}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                    selectedCard === c.id
                      ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-8 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: CARD_COLORS[c.color] || '#820AD1' }}
                  >
                    {c.lastFourDigits ? `•${c.lastFourDigits.slice(-2)}` : '••'}
                  </div>
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Descricao */}
        <div className="space-y-2">
          <Label htmlFor="transaction-description" className="text-sm font-medium text-gray-700">
            Descricao
          </Label>
          <Input
            id="transaction-description"
            name="description"
            placeholder="Ex: Supermercado, Restaurante, Amazon..."
            required
            disabled={isPending}
            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-amount" className="text-sm font-medium text-gray-700">
              Valor Total (R$)
            </Label>
            <Input
              id="transaction-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              required
              disabled={isPending}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Data da Compra
            </Label>
            <DatePicker
              date={selectedDate}
              onDateChange={(date) => {
                setSelectedDate(date)
                setCustomFirstInvoiceDate(undefined) // Reset quando muda a data
              }}
              placeholder="Data da compra"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Alerta de compra retroativa */}
        {isRetroactive && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Compra retroativa detectada</p>
              <p className="text-amber-700 mt-0.5">
                Esta compra foi feita no passado. Use as opcoes avancadas para indicar quantas parcelas ja foram pagas.
              </p>
            </div>
          </div>
        )}

        {/* Parcelas */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Parcelas</Label>
          <div className="flex flex-wrap gap-2">
            {INSTALLMENT_OPTIONS.map(num => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setSelectedInstallments(num)
                  if (paidInstallments >= num) {
                    setPaidInstallments(Math.max(0, num - 1))
                  }
                }}
                disabled={isPending}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedInstallments === num
                    ? 'bg-blue-500 text-white scale-105 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {num}x
              </button>
            ))}
          </div>
        </div>

        {/* Info da Fatura (sempre visivel quando cartao selecionado) */}
        {card && firstInvoice && amount && (
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Distribuicao das Parcelas</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAdvanced ? 'Ocultar opcoes' : 'Opcoes avancadas'}
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Resumo rapido */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-500">Primeira Fatura</p>
                <p className="font-semibold text-gray-900">
                  {MONTHS[firstInvoice.month]} {firstInvoice.year}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-500">Valor por Parcela</p>
                <p className="font-semibold text-blue-600">
                  {formatCurrency(parseFloat(amount) / selectedInstallments)}
                </p>
              </div>
            </div>

            {/* Opcoes avancadas */}
            {showAdvanced && (
              <div className="space-y-4 pt-3 border-t border-gray-200">
                {/* Selecionar primeira fatura */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Ajustar primeira fatura</Label>
                  <DatePicker
                    date={customFirstInvoiceDate || firstInvoice.dueDate}
                    onDateChange={(date) => setCustomFirstInvoiceDate(date)}
                    placeholder="Selecione a data da primeira fatura"
                  />
                  <p className="text-xs text-gray-500">
                    Use isso se a compra foi feita em outra data ou para ajustar manualmente
                  </p>
                </div>

                {/* Parcelas ja pagas */}
                {selectedInstallments > 1 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Parcelas ja pagas</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max={selectedInstallments - 1}
                        value={paidInstallments}
                        onChange={(e) => setPaidInstallments(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <span className="w-16 text-center font-semibold text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        {paidInstallments}/{selectedInstallments}
                      </span>
                    </div>
                    {paidInstallments > 0 && (
                      <p className="text-xs text-emerald-600">
                        {paidInstallments} parcela{paidInstallments > 1 ? 's' : ''} ja paga{paidInstallments > 1 ? 's' : ''} ({formatCurrency((parseFloat(amount) / selectedInstallments) * paidInstallments)})
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Preview das parcelas */}
            {selectedInstallments > 1 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Preview das parcelas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {installmentsPreview.slice(0, 6).map((inst) => (
                    <div
                      key={inst.number}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        inst.isPaid
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {inst.isPaid && <CheckCircle2 className="w-3 h-3" />}
                      <span className="font-mono">{inst.number}/{selectedInstallments}</span>
                      <span className="text-gray-400">•</span>
                      <span>{inst.month.slice(0, 3)}/{inst.year.toString().slice(-2)}</span>
                    </div>
                  ))}
                  {installmentsPreview.length > 6 && (
                    <div className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                      +{installmentsPreview.length - 6} mais
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resumo final */}
            {paidInstallments > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700">Parcelas restantes</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-700">{pendingInstallments}x</span>
                    <span className="text-sm text-blue-600 ml-2">{formatCurrency(pendingAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botao Submit */}
        <Button
          type="submit"
          disabled={isPending || cards.length === 0}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {paidInstallments > 0
                ? `Adicionar Compra (${pendingInstallments} parcelas pendentes)`
                : 'Adicionar Compra'
              }
            </>
          )}
        </Button>
      </form>
    </>
  )
}
