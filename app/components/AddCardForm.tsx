'use client'

import { createCard } from '@/app/actions/cards'
import { useTransition, useState } from 'react'
import Toast from './Toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Loader2 } from 'lucide-react'

const CARD_COLORS = [
  { value: 'nubank', label: 'Roxo Nubank', color: '#820AD1' },
  { value: 'inter', label: 'Laranja Inter', color: '#FF7A00' },
  { value: 'c6blue', label: 'Azul C6', color: '#1F51AC' },
  { value: 'black', label: 'Preto Carbon', color: '#1A1A1A' },
  { value: 'platinum', label: 'Prata Platinum', color: '#C0C0C0' },
  { value: 'gold', label: 'Dourado Gold', color: '#D4AF37' },
  { value: 'red', label: 'Vermelho', color: '#D32F2F' },
  { value: 'graphite', label: 'Cinza Grafite', color: '#424242' },
]

const CARD_BRANDS = [
  { value: 'mastercard', label: 'Mastercard', icon: '🔴🟡' },
  { value: 'visa', label: 'Visa', icon: '💳' },
  { value: 'elo', label: 'Elo', icon: '🟡' },
  { value: 'amex', label: 'American Express', icon: '💠' },
]

interface AddCardFormProps {
  onSuccess?: () => void
}

export default function AddCardForm({ onSuccess }: AddCardFormProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedColor, setSelectedColor] = useState('nubank')
  const [selectedBrand, setSelectedBrand] = useState('mastercard')

  async function handleSubmit(formData: FormData) {
    formData.set('color', selectedColor)
    formData.set('brand', selectedBrand)

    startTransition(async () => {
      const result = await createCard(formData)

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        const form = document.getElementById('card-form') as HTMLFormElement
        form?.reset()
        setSelectedColor('nubank')
        setSelectedBrand('mastercard')
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

      <form id="card-form" action={handleSubmit} className="space-y-4">
        {/* Nome do Cartão */}
        <div className="space-y-2">
          <Label htmlFor="card-name" className="text-sm font-medium text-gray-700">
            Nome do Cartão
          </Label>
          <Input
            id="card-name"
            name="name"
            placeholder="Ex: Nubank, Inter, C6..."
            required
            disabled={isPending}
            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Cor do Cartão */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Cor do Cartão</Label>
          <div className="grid grid-cols-4 gap-2">
            {CARD_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                disabled={isPending}
                style={{ backgroundColor: color.color }}
                className={`h-12 rounded-lg transition-all duration-200 ${
                  selectedColor === color.value
                    ? 'ring-2 ring-offset-2 ring-blue-500 scale-105'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
              >
                {selectedColor === color.value && (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {CARD_COLORS.find(c => c.value === selectedColor)?.label}
          </p>
        </div>

        {/* Bandeira */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Bandeira</Label>
          <div className="grid grid-cols-4 gap-2">
            {CARD_BRANDS.map((brand) => (
              <button
                key={brand.value}
                type="button"
                onClick={() => setSelectedBrand(brand.value)}
                disabled={isPending}
                className={`h-12 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                  selectedBrand === brand.value
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                }`}
              >
                <span className="text-lg">{brand.icon}</span>
                <span className="text-[10px] font-medium text-gray-600">{brand.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4 Últimos Dígitos e Limite */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastFourDigits" className="text-sm font-medium text-gray-700">
              4 Últimos Dígitos
            </Label>
            <Input
              id="lastFourDigits"
              name="lastFourDigits"
              placeholder="1234"
              maxLength={4}
              pattern="[0-9]{4}"
              disabled={isPending}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center font-mono text-lg tracking-widest"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-limit" className="text-sm font-medium text-gray-700">
              Limite (R$)
            </Label>
            <Input
              id="card-limit"
              name="limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="5.000,00"
              required
              disabled={isPending}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 font-semibold"
            />
          </div>
        </div>

        {/* Fechamento e Vencimento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="closingDay" className="text-sm font-medium text-gray-700">
              Dia Fechamento
            </Label>
            <Input
              id="closingDay"
              name="closingDay"
              type="number"
              min="1"
              max="31"
              placeholder="10"
              required
              disabled={isPending}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center text-lg font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDay" className="text-sm font-medium text-gray-700">
              Dia Vencimento
            </Label>
            <Input
              id="dueDay"
              name="dueDay"
              type="number"
              min="1"
              max="31"
              placeholder="17"
              required
              disabled={isPending}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center text-lg font-semibold"
            />
          </div>
        </div>

        {/* Botão Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Adicionar Cartão
            </>
          )}
        </Button>
      </form>
    </>
  )
}
