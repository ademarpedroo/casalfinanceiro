'use client'

import { CreditCard, Trash2, MoreVertical, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { deleteCard } from '@/app/actions/cards'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CreditCardDisplayProps {
  card: {
    id: string
    name: string
    limit: number
    closingDay: number
    dueDay: number
    color?: string
    brand?: string
    lastFourDigits?: string
  }
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
  // Fallback para cores antigas (compatibilidade)
  purple: '#820AD1',
  blue: '#1F51AC',
  orange: '#FF7A00',
  green: '#10B981',
  dark: '#1A1A1A',
  golden: '#D4AF37',
}

export default function CreditCardDisplay({ card }: CreditCardDisplayProps) {
  const [showActions, setShowActions] = useState(false)
  const cardColor = CARD_COLORS[card.color || 'nubank'] || CARD_COLORS.nubank

  const formatLimit = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatCardNumber = () => {
    const lastFour = card.lastFourDigits || card.id.slice(-4)
    return `•••• •••• •••• ${lastFour}`
  }

  const getBrandColors = () => {
    const brands: Record<string, { primary: string; secondary: string }> = {
      mastercard: { primary: 'bg-red-500', secondary: 'bg-orange-400' },
      visa: { primary: 'bg-blue-600', secondary: 'bg-yellow-400' },
      elo: { primary: 'bg-yellow-500', secondary: 'bg-black' },
      amex: { primary: 'bg-blue-500', secondary: 'bg-blue-600' },
    }
    return brands[card.brand || 'mastercard'] || brands.mastercard
  }

  const brandColors = getBrandColors()

  async function handleDelete() {
    if (confirm(`Tem certeza que deseja excluir o cartão ${card.name}?`)) {
      const result = await deleteCard(card.id)
      if (result?.error) {
        alert(result.error)
      }
    }
  }

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Cartão de Crédito - Design Limpo e Moderno */}
      <div
        className="relative w-full aspect-[1.586/1] rounded-2xl shadow-xl transform transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl cursor-pointer overflow-hidden"
        style={{ backgroundColor: cardColor }}
      >
        {/* Subtle Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20"></div>

        {/* Subtle Noise Texture for Premium Look */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

        {/* Card Content */}
        <div className="relative h-full p-6 flex flex-col justify-between text-white">

          {/* Header - Logo e Menu */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              {/* Chip 3D */}
              <div className="w-14 h-11 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-400 shadow-lg relative overflow-hidden">
                <div className="absolute inset-1 rounded-md border-2 border-amber-600/30"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
              </div>

              {/* Contactless Icon */}
              <div className="flex gap-1">
                <div className="w-3 h-3 border-2 border-white/60 rounded-full"></div>
                <div className="w-3 h-3 border-2 border-white/60 rounded-full -ml-1.5"></div>
                <div className="w-3 h-3 border-2 border-white/60 rounded-full -ml-1.5"></div>
              </div>
            </div>

            {/* Actions Menu */}
            <div className={`
              transition-opacity duration-300
              ${showActions ? 'opacity-100' : 'opacity-0'}
            `}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Cartão
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Card Number */}
          <div className="space-y-1">
            <div className="font-mono text-xl md:text-2xl tracking-[0.3em] font-light">
              {formatCardNumber()}
            </div>
          </div>

          {/* Card Info */}
          <div className="flex items-end justify-between">
            {/* Nome e Validade */}
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-70 font-medium mb-1">
                  Nome do Titular
                </div>
                <div className="font-semibold text-sm md:text-base uppercase tracking-wider">
                  {card.name}
                </div>
              </div>

              <div className="flex gap-6 text-xs">
                <div>
                  <div className="opacity-70 mb-0.5">Fecha</div>
                  <div className="font-bold">Dia {card.closingDay}</div>
                </div>
                <div>
                  <div className="opacity-70 mb-0.5">Vence</div>
                  <div className="font-bold">Dia {card.dueDay}</div>
                </div>
              </div>
            </div>

            {/* Limite */}
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider opacity-70 font-medium mb-1">
                Limite Total
              </div>
              <div className="font-bold text-base md:text-lg">
                {formatLimit(card.limit)}
              </div>
            </div>
          </div>

          {/* Card Brand (Mastercard/Visa style) */}
          <div className="absolute bottom-6 right-6 flex gap-1.5 opacity-80">
            <div className={`w-8 h-8 rounded-full ${brandColors.primary} mix-blend-screen`}></div>
            <div className={`w-8 h-8 rounded-full ${brandColors.secondary} mix-blend-screen -ml-4`}></div>
          </div>
        </div>

        {/* Premium Badge */}
        <div className="absolute top-4 right-4 opacity-20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
