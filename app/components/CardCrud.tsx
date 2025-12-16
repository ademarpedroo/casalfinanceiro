'use client'

import { useState, useTransition } from 'react'
import { createCard, deleteCard, deleteTransaction, markInstallmentAsPaid, markInstallmentAsUnpaid } from '@/app/actions/cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Search, CreditCard, Loader2, ArrowUpDown, ShoppingCart, Receipt, ChevronLeft, ChevronRight, Check, X, Pencil } from 'lucide-react'
import Toast from './Toast'
import AddCardTransactionForm from './AddCardTransactionForm'
import EditTransactionModal from './EditTransactionModal'

interface CreditCardType {
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

interface Transaction {
  id: string
  cardId: string
  description: string
  totalAmount: number
  purchaseDate: Date
  installmentsCount: number
  card: CreditCardType
  installments: Installment[]
}

interface Installment {
  id: string
  transactionId: string
  number: number
  amount: number
  dueDate: Date
  isPaid: boolean
  paidAt?: Date | null
  transaction?: Transaction
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

const CARD_BRANDS: Record<string, { label: string; icon: string }> = {
  mastercard: { label: 'Mastercard', icon: '🔴🟡' },
  visa: { label: 'Visa', icon: '💳' },
  elo: { label: 'Elo', icon: '🟡' },
  amex: { label: 'American Express', icon: '💠' },
}

const CARD_COLOR_OPTIONS = [
  { value: 'nubank', label: 'Roxo Nubank', color: '#820AD1' },
  { value: 'inter', label: 'Laranja Inter', color: '#FF7A00' },
  { value: 'c6blue', label: 'Azul C6', color: '#1F51AC' },
  { value: 'black', label: 'Preto Carbon', color: '#1A1A1A' },
  { value: 'platinum', label: 'Prata Platinum', color: '#C0C0C0' },
  { value: 'gold', label: 'Dourado Gold', color: '#D4AF37' },
  { value: 'red', label: 'Vermelho', color: '#D32F2F' },
  { value: 'graphite', label: 'Cinza Grafite', color: '#424242' },
]

const CARD_BRAND_OPTIONS = [
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

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

interface CardCrudProps {
  cards: CreditCardType[]
  transactions?: Transaction[]
}

export default function CardCrud({ cards, transactions = [] }: CardCrudProps) {
  const [isPending, startTransition] = useTransition()
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedColor, setSelectedColor] = useState('nubank')
  const [selectedBrand, setSelectedBrand] = useState('mastercard')
  const [activeTab, setActiveTab] = useState('cartoes')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  // Invoice state
  const now = new Date()
  const [invoiceMonth, setInvoiceMonth] = useState(now.getMonth() + 1)
  const [invoiceYear, setInvoiceYear] = useState(now.getFullYear())
  const [selectedCardId, setSelectedCardId] = useState<string | null>(cards[0]?.id || null)

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  // Get installments for invoice
  const selectedCard = cards.find(c => c.id === selectedCardId)
  const invoiceInstallments = transactions
    .filter(t => t.cardId === selectedCardId)
    .flatMap(t => t.installments.map(inst => ({ ...inst, transaction: t })))
    .filter(inst => {
      const dueDate = new Date(inst.dueDate)
      return dueDate.getMonth() + 1 === invoiceMonth && dueDate.getFullYear() === invoiceYear
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const invoiceTotal = invoiceInstallments.reduce((sum, inst) => sum + inst.amount, 0)
  const invoicePaid = invoiceInstallments.filter(i => i.isPaid).reduce((sum, inst) => sum + inst.amount, 0)
  const invoicePending = invoiceTotal - invoicePaid

  async function handleCreateCard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('color', selectedColor)
    formData.set('brand', selectedBrand)

    startTransition(async () => {
      const result = await createCard(formData)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        setIsCardDialogOpen(false)
        setSelectedColor('nubank')
        setSelectedBrand('mastercard')
      } else {
        setToast({ message: result?.error || 'Erro ao criar', type: 'error' })
      }
    })
  }

  async function handleDeleteCard(id: string, name: string) {
    if (confirm(`Excluir cartao "${name}"? Todas as transacoes serao removidas.`)) {
      setDeletingId(id)
      const result = await deleteCard(id)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        if (selectedCardId === id) {
          setSelectedCardId(cards.find(c => c.id !== id)?.id || null)
        }
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
      setDeletingId(null)
    }
  }

  async function handleDeleteTransaction(id: string, description: string) {
    if (confirm(`Excluir "${description}"? Todas as parcelas serao removidas.`)) {
      setDeletingId(id)
      const result = await deleteTransaction(id)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
      setDeletingId(null)
    }
  }

  async function handleToggleInstallment(installment: Installment) {
    startTransition(async () => {
      const result = installment.isPaid
        ? await markInstallmentAsUnpaid(installment.id)
        : await markInstallmentAsPaid(installment.id)

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro', type: 'error' })
      }
    })
  }

  function changeInvoiceMonth(delta: number) {
    let newMonth = invoiceMonth + delta
    let newYear = invoiceYear

    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }

    setInvoiceMonth(newMonth)
    setInvoiceYear(newYear)
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
            <p className="text-sm text-gray-500 mt-1">Gerencie seus cartoes e compras</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Add Transaction Button */}
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 font-medium border-blue-200 text-blue-600 hover:bg-blue-50"
                  disabled={cards.length === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Nova Compra
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Nova Compra no Cartao</DialogTitle>
                </DialogHeader>
                <AddCardTransactionForm
                  cards={cards}
                  onSuccess={() => setIsTransactionDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Create Card Button */}
            <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="h-10 font-medium"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cartao
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Criar Cartao</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateCard} className="space-y-4 mt-2">
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

                  <div className="space-y-2">
                    <Label>Cor do Cartao</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {CARD_COLOR_OPTIONS.map((color) => (
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
                  </div>

                  <div className="space-y-2">
                    <Label>Bandeira</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {CARD_BRAND_OPTIONS.map((brand) => (
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-100 p-1 h-auto">
            <TabsTrigger
              value="cartoes"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Meus Cartoes
            </TabsTrigger>
            <TabsTrigger
              value="fatura"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Fatura
            </TabsTrigger>
            <TabsTrigger
              value="transacoes"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Todas Compras
            </TabsTrigger>
          </TabsList>

          {/* Cartoes Tab */}
          <TabsContent value="cartoes" className="mt-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cartoes..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 w-full sm:w-[280px] h-10 border-gray-200"
                />
              </div>
            </div>

            {filteredCards.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <CreditCard className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum cartao encontrado</h3>
                <p className="text-gray-500">
                  {searchFilter ? 'Tente outro termo de busca' : 'Clique em "Novo Cartao" para adicionar'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className={`group relative rounded-2xl p-5 text-white transition-all hover:scale-[1.02] hover:shadow-xl ${
                      deletingId === card.id ? 'opacity-50' : ''
                    }`}
                    style={{
                      backgroundColor: CARD_COLORS[card.color] || '#820AD1',
                      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
                    }}
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteCard(card.id, card.name)}
                      disabled={deletingId === card.id}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 text-white/80 hover:bg-white/30 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {deletingId === card.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>

                    {/* Card chip */}
                    <div className="w-10 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md mb-6 flex items-center justify-center">
                      <div className="w-6 h-5 border-2 border-yellow-600/30 rounded-sm"></div>
                    </div>

                    {/* Card number hint */}
                    <div className="font-mono text-lg tracking-widest mb-4 text-white/90">
                      •••• •••• •••• {card.lastFourDigits || '••••'}
                    </div>

                    {/* Card name */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider">Nome</p>
                        <p className="font-semibold text-lg">{card.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl">{CARD_BRANDS[card.brand]?.icon || '💳'}</p>
                      </div>
                    </div>

                    {/* Card details */}
                    <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-white/60">Limite</p>
                        <p className="font-semibold text-sm">{formatCurrency(card.limit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Fecha</p>
                        <p className="font-semibold text-sm">Dia {card.closingDay}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Vence</p>
                        <p className="font-semibold text-sm">Dia {card.dueDay}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Fatura Tab */}
          <TabsContent value="fatura" className="mt-6">
            {cards.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <Receipt className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum cartao cadastrado</h3>
                <p className="text-gray-500">Cadastre um cartao para ver a fatura</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Card Selector */}
                <div className="flex flex-wrap gap-2">
                  {cards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        selectedCardId === card.id
                          ? 'ring-2 ring-blue-500 shadow-md'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: selectedCardId === card.id ? CARD_COLORS[card.color] : undefined,
                        color: selectedCardId === card.id ? 'white' : undefined,
                      }}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="font-medium">{card.name}</span>
                    </button>
                  ))}
                </div>

                {/* Invoice Header */}
                {selectedCard && (
                  <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-8 rounded flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: CARD_COLORS[selectedCard.color] }}
                        >
                          {selectedCard.lastFourDigits ? `•${selectedCard.lastFourDigits.slice(-2)}` : '••'}
                        </div>
                        <div>
                          <p className="font-semibold">{selectedCard.name}</p>
                          <p className="text-sm text-gray-400">Vencimento dia {selectedCard.dueDay}</p>
                        </div>
                      </div>

                      {/* Month Navigator */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => changeInvoiceMonth(-1)}
                          className="text-white hover:bg-white/10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <span className="font-medium min-w-[140px] text-center">
                          {MONTHS[invoiceMonth - 1]} {invoiceYear}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => changeInvoiceMonth(1)}
                          className="text-white hover:bg-white/10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Total da Fatura</p>
                        <p className="text-2xl font-bold">{formatCurrency(invoiceTotal)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-400">Pago</p>
                        <p className="text-2xl font-bold text-emerald-400">{formatCurrency(invoicePaid)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-amber-400">Pendente</p>
                        <p className="text-2xl font-bold text-amber-400">{formatCurrency(invoicePending)}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Invoice Items */}
                <div className="bg-white rounded-lg border border-gray-200">
                  {invoiceInstallments.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhuma compra neste periodo</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="w-12">Pago</TableHead>
                          <TableHead>Descricao</TableHead>
                          <TableHead>Parcela</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceInstallments.map((inst) => (
                          <TableRow key={inst.id} className={inst.isPaid ? 'bg-emerald-50/50' : ''}>
                            <TableCell>
                              <button
                                onClick={() => handleToggleInstallment(inst)}
                                disabled={isPending}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  inst.isPaid
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-gray-300 hover:border-blue-500'
                                }`}
                              >
                                {inst.isPaid && <Check className="w-4 h-4" />}
                              </button>
                            </TableCell>
                            <TableCell>
                              <span className={inst.isPaid ? 'text-gray-500 line-through' : 'font-medium'}>
                                {inst.transaction?.description}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-mono">
                                {inst.number}/{inst.transaction?.installmentsCount}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatDate(inst.dueDate)}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${inst.isPaid ? 'text-gray-400' : 'text-gray-900'}`}>
                              {formatCurrency(inst.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Transacoes Tab */}
          <TabsContent value="transacoes" className="mt-6">
            <div className="bg-white rounded-lg border border-gray-200">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma compra registrada</h3>
                  <p className="text-gray-500">Clique em "Nova Compra" para adicionar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Descricao</TableHead>
                      <TableHead>Cartao</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Parcelas</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const paidCount = transaction.installments.filter(i => i.isPaid).length
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-4 rounded"
                                style={{ backgroundColor: CARD_COLORS[transaction.card.color] }}
                              />
                              <span className="text-sm text-gray-600">{transaction.card.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {formatDate(transaction.purchaseDate)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={paidCount === transaction.installmentsCount ? 'default' : 'secondary'}>
                              {paidCount}/{transaction.installmentsCount} pagas
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(transaction.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTransaction(transaction)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                                title="Ajustar parcelas"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTransaction(transaction.id, transaction.description)}
                                disabled={deletingId === transaction.id}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                title="Excluir compra"
                              >
                                {deletingId === transaction.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Edicao */}
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />
    </>
  )
}
