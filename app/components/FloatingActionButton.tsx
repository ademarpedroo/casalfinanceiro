'use client'

import { useState } from 'react'
import { Plus, X, TrendingUp, TrendingDown, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AddIncomeForm from './AddIncomeForm'
import AddExpenseForm from './AddExpenseForm'
import AddCardForm from './AddCardForm'

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

interface FloatingActionButtonProps {
  categories: Category[]
}

type FormType = 'income' | 'expense' | 'card' | null

export default function FloatingActionButton({ categories }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeForm, setActiveForm] = useState<FormType>(null)

  const handleOpenForm = (type: FormType) => {
    setActiveForm(type)
    setIsOpen(false)
  }

  const handleCloseForm = () => {
    setActiveForm(null)
  }

  const formConfig = {
    income: {
      title: 'Nova Receita',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
    },
    expense: {
      title: 'Nova Despesa',
      icon: TrendingDown,
      color: 'from-orange-500 to-red-500',
    },
    card: {
      title: 'Novo Cartão',
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-600',
    },
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu de opções */}
      <div className={`fixed bottom-24 right-6 z-50 flex flex-col gap-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {/* Receita */}
        <button
          onClick={() => handleOpenForm('income')}
          className="flex items-center gap-3 bg-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
            Receita
          </span>
        </button>

        {/* Despesa */}
        <button
          onClick={() => handleOpenForm('expense')}
          className="flex items-center gap-3 bg-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
            Despesa
          </span>
        </button>

        {/* Cartão */}
        <button
          onClick={() => handleOpenForm('card')}
          className="flex items-center gap-3 bg-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
            Cartão
          </span>
        </button>
      </div>

      {/* FAB Principal */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 p-0 ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-800 rotate-45'
            : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:scale-110'
        }`}
        aria-label={isOpen ? 'Fechar menu' : 'Adicionar'}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-7 w-7 text-white" />
        )}
      </Button>

      {/* Dialog para Receita */}
      <Dialog open={activeForm === 'income'} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Nova Receita
            </DialogTitle>
          </DialogHeader>
          <AddIncomeForm categories={categories} onSuccess={handleCloseForm} />
        </DialogContent>
      </Dialog>

      {/* Dialog para Despesa */}
      <Dialog open={activeForm === 'expense'} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              Nova Despesa
            </DialogTitle>
          </DialogHeader>
          <AddExpenseForm categories={categories} onSuccess={handleCloseForm} />
        </DialogContent>
      </Dialog>

      {/* Dialog para Cartão */}
      <Dialog open={activeForm === 'card'} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              Novo Cartão
            </DialogTitle>
          </DialogHeader>
          <AddCardForm onSuccess={handleCloseForm} />
        </DialogContent>
      </Dialog>
    </>
  )
}
