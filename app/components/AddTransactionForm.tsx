'use client'

import { useState, useTransition } from 'react'
import { createTransaction } from '@/app/actions/cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { CreditCard, Loader2, ShoppingCart } from 'lucide-react'
import Toast from './Toast'

interface Card {
  id: string
  name: string
  color: string
  brand: string
}

interface AddTransactionFormProps {
  cards: Card[]
  onSuccess?: () => void
}

export default function AddTransactionForm({ cards, onSuccess }: AddTransactionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCard, setSelectedCard] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  async function handleSubmit(formData: FormData) {
    formData.set('cardId', selectedCard)
    if (selectedDate) {
      formData.set('purchaseDate', selectedDate.toISOString().split('T')[0])
    }

    startTransition(async () => {
      const result = await createTransaction(formData)

      if (result?.success) {
        setToast({ message: result.message || 'Transação criada!', type: 'success' })
        const form = document.getElementById('transaction-form') as HTMLFormElement
        form?.reset()
        setSelectedCard('')
        setSelectedDate(new Date())
        onSuccess?.()
      } else {
        setToast({ message: result?.error || 'Erro ao criar transação', type: 'error' })
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

      <form id="transaction-form" action={handleSubmit} className="space-y-4">
        {/* Cartão */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Cartão</Label>
          <Select value={selectedCard} onValueChange={setSelectedCard}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecione o cartão" />
            </SelectTrigger>
            <SelectContent>
              {cards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: card.color || '#6366F1' }}
                    />
                    <span>{card.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="trans-description" className="text-sm font-medium text-gray-700">
            Descrição
          </Label>
          <Input
            id="trans-description"
            name="description"
            placeholder="Ex: Geladeira, TV, Roupas..."
            required
            disabled={isPending}
            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Valor e Parcelas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trans-amount" className="text-sm font-medium text-gray-700">
              Valor Total (R$)
            </Label>
            <Input
              id="trans-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              required
              disabled={isPending}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trans-installments" className="text-sm font-medium text-gray-700">
              Parcelas
            </Label>
            <Input
              id="trans-installments"
              name="installments"
              type="number"
              min="1"
              max="48"
              defaultValue="1"
              required
              disabled={isPending}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center font-semibold"
            />
          </div>
        </div>

        {/* Data da Compra */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Data da Compra
          </Label>
          <DatePicker
            date={selectedDate}
            onDateChange={setSelectedDate}
            placeholder="Quando foi a compra?"
            disabled={isPending}
          />
        </div>

        {/* Botão Submit */}
        <Button
          type="submit"
          disabled={isPending || !selectedCard}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Lançar Compra
            </>
          )}
        </Button>
      </form>
    </>
  )
}
