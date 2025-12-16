'use client'

import { createExpense } from '@/app/actions/expenses'
import { createTransaction } from '@/app/actions/cards'
import { useTransition, useState } from 'react'
import Toast from './Toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { TrendingDown, Loader2, Clock, CreditCard, Banknote } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

interface Card {
  id: string
  name: string
  color: string
  brand: string
  lastFourDigits?: string | null
}

interface AddExpenseFormProps {
  categories: Category[]
  cards?: Card[]
  onSuccess?: () => void
  compact?: boolean
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

export default function AddExpenseForm({ categories, cards = [], onSuccess, compact = false }: AddExpenseFormProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isFixed, setIsFixed] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [amount, setAmount] = useState<string>('')

  // Card related state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [selectedCard, setSelectedCard] = useState<string>('')
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1)

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

  const installmentValue = amount && selectedInstallments > 0
    ? parseFloat(amount) / selectedInstallments
    : 0

  function resetForm() {
    setSelectedCategory('')
    setIsFixed(false)
    setSelectedDate(new Date())
    setAmount('')
    setPaymentMethod('cash')
    setSelectedCard('')
    setSelectedInstallments(1)
  }

  async function handleSubmit(formData: FormData) {
    const description = formData.get('description') as string
    const amountValue = formData.get('amount') as string

    if (!description || !amountValue) {
      setToast({ message: 'Preencha todos os campos obrigatorios', type: 'error' })
      return
    }

    startTransition(async () => {
      // If payment method is card, create a CardTransaction
      if (paymentMethod === 'card' && selectedCard) {
        const cardFormData = new FormData()
        cardFormData.set('cardId', selectedCard)
        cardFormData.set('description', description)
        cardFormData.set('amount', amountValue)
        cardFormData.set('installments', selectedInstallments.toString())
        if (selectedDate) {
          cardFormData.set('purchaseDate', selectedDate.toISOString().split('T')[0])
        }

        const result = await createTransaction(cardFormData)

        if (result?.success) {
          setToast({ message: 'Compra no cartao registrada com sucesso!', type: 'success' })
          const form = document.getElementById('expense-form') as HTMLFormElement
          form?.reset()
          resetForm()
          onSuccess?.()
        } else {
          setToast({ message: result?.error || 'Erro ao registrar compra', type: 'error' })
        }
      } else {
        // Create a regular Expense
        if (selectedCategory) {
          formData.set('categoryId', selectedCategory)
        }
        formData.set('isFixed', isFixed ? 'true' : 'false')
        if (selectedDate) {
          formData.set('dueDate', selectedDate.toISOString().split('T')[0])
        }

        const result = await createExpense(formData)

        if (result?.success) {
          setToast({ message: result.message!, type: 'success' })
          const form = document.getElementById('expense-form') as HTMLFormElement
          form?.reset()
          resetForm()
          onSuccess?.()
        } else {
          setToast({ message: result?.error || 'Erro desconhecido', type: 'error' })
        }
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

      <form id="expense-form" action={handleSubmit} className="space-y-4">
        {/* Forma de Pagamento */}
        {cards.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Forma de Pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash')
                  setSelectedCard('')
                  setSelectedInstallments(1)
                }}
                disabled={isPending}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="font-medium">Dinheiro/Pix/Boleto</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                disabled={isPending}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Cartao de Credito</span>
              </button>
            </div>
          </div>
        )}

        {/* Selecao de Cartao (se pagamento for cartao) */}
        {paymentMethod === 'card' && cards.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Cartao</Label>
            <div className="grid grid-cols-2 gap-2">
              {cards.map(card => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedCard(selectedCard === card.id ? '' : card.id)}
                  disabled={isPending}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                    selectedCard === card.id
                      ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-8 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: CARD_COLORS[card.color] || '#820AD1' }}
                  >
                    {card.lastFourDigits ? `•${card.lastFourDigits.slice(-2)}` : '••'}
                  </div>
                  <span className="truncate">{card.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Descricao */}
        <div className="space-y-2">
          <Label htmlFor="expense-description" className="text-sm font-medium text-gray-700">
            Descricao
          </Label>
          <Input
            id="expense-description"
            name="description"
            placeholder="Ex: Conta de luz, Mercado, Uber..."
            required
            disabled={isPending}
            className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expense-amount" className="text-sm font-medium text-gray-700">
              Valor (R$)
            </Label>
            <Input
              id="expense-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              required
              disabled={isPending}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500 font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {paymentMethod === 'card' ? 'Data da Compra' : 'Vencimento'}
            </Label>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder={paymentMethod === 'card' ? 'Data da compra' : 'Data de vencimento'}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Parcelas (so aparece se for cartao) */}
        {paymentMethod === 'card' && selectedCard && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Parcelas</Label>
            <div className="flex flex-wrap gap-2">
              {INSTALLMENT_OPTIONS.map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSelectedInstallments(num)}
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
            {amount && selectedInstallments > 1 && (
              <p className="text-sm text-gray-500 mt-2">
                {selectedInstallments}x de{' '}
                <span className="font-semibold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentValue)}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Categoria (so aparece se NAO for cartao) */}
        {paymentMethod === 'cash' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Categoria</Label>
            <div className="flex flex-wrap gap-2">
              {expenseCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                  disabled={isPending}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? 'ring-2 ring-offset-2 ring-orange-500 scale-105'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === cat.id ? cat.color : `${cat.color}15`,
                    color: selectedCategory === cat.id ? 'white' : cat.color,
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conta Fixa (so aparece se NAO for cartao) */}
        {paymentMethod === 'cash' && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              id="isFixed"
              checked={isFixed}
              onCheckedChange={(checked) => setIsFixed(checked as boolean)}
              disabled={isPending}
              className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <Label htmlFor="isFixed" className="text-sm font-medium cursor-pointer text-gray-700">
                Conta fixa mensal
              </Label>
            </div>
          </div>
        )}

        {/* Botao Submit */}
        <Button
          type="submit"
          disabled={isPending || (paymentMethod === 'card' && !selectedCard)}
          className={`w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all ${
            paymentMethod === 'card'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              {paymentMethod === 'card' ? (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Registrar Compra no Cartao
                </>
              ) : (
                <>
                  <TrendingDown className="mr-2 h-5 w-5" />
                  Adicionar Despesa
                </>
              )}
            </>
          )}
        </Button>
      </form>
    </>
  )
}
