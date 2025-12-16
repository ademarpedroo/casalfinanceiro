'use client'

import { createTransaction } from '@/app/actions/cards'
import { useTransition, useState } from 'react'
import Toast from './Toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { CreditCard, Loader2, ShoppingCart } from 'lucide-react'

interface Card {
  id: string
  name: string
  color: string
  brand: string
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

export default function AddCardTransactionForm({ cards, onSuccess }: AddCardTransactionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCard, setSelectedCard] = useState<string>('')
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [amount, setAmount] = useState<string>('')

  const installmentValue = amount && selectedInstallments > 0
    ? parseFloat(amount) / selectedInstallments
    : 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (!selectedCard) {
      setToast({ message: 'Selecione um cartao', type: 'error' })
      return
    }

    formData.set('cardId', selectedCard)
    formData.set('installments', selectedInstallments.toString())
    if (selectedDate) {
      formData.set('purchaseDate', selectedDate.toISOString().split('T')[0])
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
              onDateChange={setSelectedDate}
              placeholder="Data da compra"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Parcelas */}
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
              Adicionar Compra
            </>
          )}
        </Button>
      </form>
    </>
  )
}
