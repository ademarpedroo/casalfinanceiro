'use client'

import { useState, useTransition } from 'react'
import { createCard, deleteCard } from '@/app/actions/cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Search, CreditCard, Loader2, ArrowUpDown } from 'lucide-react'
import Toast from './Toast'

interface Card {
  id: string
  name: string
  limit: number
  closingDay: number
  dueDay: number
  color: string
  brand: string
  lastFourDigits?: string | null
  transactions?: any[]
}

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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getCardColor(colorValue: string): string {
  return CARD_COLORS.find(c => c.value === colorValue)?.color || '#820AD1'
}

function getBrandIcon(brandValue: string): string {
  return CARD_BRANDS.find(b => b.value === brandValue)?.icon || '💳'
}

function getBrandLabel(brandValue: string): string {
  return CARD_BRANDS.find(b => b.value === brandValue)?.label || 'Outro'
}

interface CardCrudProps {
  cards: Card[]
}

export default function CardCrud({ cards }: CardCrudProps) {
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState('nubank')
  const [selectedBrand, setSelectedBrand] = useState('mastercard')

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('color', selectedColor)
    formData.set('brand', selectedBrand)

    startTransition(async () => {
      const result = await createCard(formData)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        setIsDialogOpen(false)
        setSelectedColor('nubank')
        setSelectedBrand('mastercard')
      } else {
        setToast({ message: result?.error || 'Erro ao criar', type: 'error' })
      }
    })
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`Excluir cartao "${name}"? Todas as transacoes serao removidas.`)) {
      setDeletingId(id)
      const result = await deleteCard(id)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
      setDeletingId(null)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCards.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCards.map(c => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
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

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Cartoes</h1>
              <Badge
                variant="secondary"
                className="text-sm font-medium"
                style={{ backgroundColor: '#3B82F615', color: '#3B82F6' }}
              >
                {cards.length} {cards.length === 1 ? 'cartao' : 'cartoes'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">Gerencie seus cartoes de credito</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cartoes..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 w-[200px] sm:w-[280px] h-10 border-gray-200"
              />
            </div>

            {/* Create Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="h-10 font-medium"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Cartao
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Criar Cartao</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  {/* Nome do Cartao */}
                  <div className="space-y-2">
                    <Label htmlFor="card-name">Nome do Cartao</Label>
                    <Input
                      id="card-name"
                      name="name"
                      placeholder="Ex: Nubank, Inter, C6..."
                      required
                      disabled={isPending}
                      className="h-11"
                    />
                  </div>

                  {/* Cor do Cartao */}
                  <div className="space-y-2">
                    <Label>Cor do Cartao</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {CARD_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setSelectedColor(color.value)}
                          disabled={isPending}
                          style={{ backgroundColor: color.color }}
                          className={`h-10 rounded-lg transition-all duration-200 ${
                            selectedColor === color.value
                              ? 'ring-2 ring-offset-2 ring-blue-500 scale-105'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {CARD_COLORS.find(c => c.value === selectedColor)?.label}
                    </p>
                  </div>

                  {/* Bandeira */}
                  <div className="space-y-2">
                    <Label>Bandeira</Label>
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

                  {/* 4 Ultimos Digitos e Limite */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastFourDigits">4 Ultimos Digitos</Label>
                      <Input
                        id="lastFourDigits"
                        name="lastFourDigits"
                        placeholder="1234"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        disabled={isPending}
                        className="h-11 text-center font-mono text-lg tracking-widest"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="card-limit">Limite (R$)</Label>
                      <Input
                        id="card-limit"
                        name="limit"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="5.000,00"
                        required
                        disabled={isPending}
                        className="h-11 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Fechamento e Vencimento */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="closingDay">Dia Fechamento</Label>
                      <Input
                        id="closingDay"
                        name="closingDay"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="10"
                        required
                        disabled={isPending}
                        className="h-11 text-center text-lg font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDay">Dia Vencimento</Label>
                      <Input
                        id="dueDay"
                        name="dueDay"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="17"
                        required
                        disabled={isPending}
                        className="h-11 text-center text-lg font-semibold"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-11"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Cartao
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-gray-100 p-1 h-auto">
            <TabsTrigger
              value="all"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              Todos os Cartoes
              <span className="ml-2 text-gray-500">{cards.length}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <CreditCard className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum cartao encontrado</h3>
              <p className="text-gray-500">
                {searchFilter ? 'Tente outro termo de busca' : 'Clique em "Criar Cartao" para adicionar'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredCards.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 -ml-2 font-medium hover:bg-transparent"
                    >
                      Nome
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Bandeira</TableHead>
                  <TableHead>Limite</TableHead>
                  <TableHead>Fechamento</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCards.map((card) => (
                  <TableRow key={card.id} className={deletingId === card.id ? 'opacity-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(card.id)}
                        onCheckedChange={() => toggleSelect(card.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-7 rounded flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: getCardColor(card.color) }}
                        >
                          {card.lastFourDigits ? `•${card.lastFourDigits.slice(-2)}` : '••'}
                        </div>
                        <span className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                          {card.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getBrandIcon(card.brand)}</span>
                        <span className="text-gray-600 text-sm">{getBrandLabel(card.brand)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-700">
                      {formatCurrency(card.limit)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      Dia {card.closingDay}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      Dia {card.dueDay}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(card.id, card.name)}
                        disabled={deletingId === card.id}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        {deletingId === card.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  )
}
