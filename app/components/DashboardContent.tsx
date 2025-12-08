'use client'

import { useEffect, useState } from 'react'
import KPICards from './KPICards'
import IncomeList from './IncomeList'
import ExpenseList from './ExpenseList'
import CreditCardDisplay from './CreditCardDisplay'
import TransactionList from './TransactionList'
import CategoryManager from './CategoryManager'
import BudgetManager from './BudgetManager'
import InstallmentList from './InstallmentList'
import AddCardForm from './AddCardForm'
import AddTransactionForm from './AddTransactionForm'
import FloatingActionButton from './FloatingActionButton'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, TrendingDown, CreditCard as CreditCardIcon, Wallet, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardContentProps {
  kpis: {
    totalIncome: number
    totalExpenses: number
    balance: number
    budgetUsage: number
  }
  incomes: any[]
  expenses: any[]
  cards: any[]
  transactions: any[]
  categories: any[]
  budgets: any[]
  availableCategories: any[]
  upcomingInstallments: any[]
  currentMonth: number
  currentYear: number
}

export default function DashboardContent({
  kpis,
  incomes,
  expenses,
  cards,
  transactions,
  categories,
  budgets,
  availableCategories,
  upcomingInstallments,
  currentMonth,
  currentYear,
}: DashboardContentProps) {
  const [activeSection, setActiveSection] = useState('dashboard')

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard'
      setActiveSection(hash)
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Dashboard Principal
  if (activeSection === 'dashboard' || activeSection === '') {
    const barChartData = [
      { mes: 'Jan', receitas: 0, despesas: 0 },
      { mes: 'Fev', receitas: 0, despesas: 0 },
      { mes: 'Mar', receitas: 0, despesas: 0 },
      { mes: 'Abr', receitas: 0, despesas: 0 },
      { mes: 'Mai', receitas: 0, despesas: 0 },
      { mes: 'Jun', receitas: 0, despesas: 0 },
    ]

    const pieChartData = budgets.length > 0
      ? budgets.map(b => ({
          name: categories.find(c => c.id === b.categoryId)?.name || 'Sem categoria',
          value: b.spent || 0,
        }))
      : [
          { name: 'Moradia', value: 0 },
          { name: 'Alimentação', value: 0 },
          { name: 'Transporte', value: 0 },
          { name: 'Lazer', value: 0 },
        ]

    const COLORS = ['#FF6B00', '#2D7EF8', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

    return (
      <>
        <div className="space-y-6">
          <KPICards {...kpis} />

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Receitas vs Despesas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10B981" name="Receitas" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="despesas" fill="#FF6B00" name="Despesas" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Despesas por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Últimas Receitas</h3>
                <Button variant="link" asChild>
                  <a href="#receitas" className="text-green-600">Ver todas</a>
                </Button>
              </div>
              <IncomeList incomes={incomes.slice(0, 5)} />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Últimas Despesas</h3>
                <Button variant="link" asChild>
                  <a href="#despesas" className="text-orange-600">Ver todas</a>
                </Button>
              </div>
              <ExpenseList expenses={expenses.slice(0, 5)} />
            </Card>
          </div>
        </div>

        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Receitas
  if (activeSection === 'receitas') {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              Receitas
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie suas receitas mensais</p>
          </div>

          {/* Card de estatística */}
          <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-10 h-10" />
              <div>
                <p className="text-sm opacity-90">Total do Mês</p>
                <p className="text-3xl font-bold">{formatCurrency(kpis.totalIncome)}</p>
              </div>
            </div>
          </Card>

          {/* Lista de receitas */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Todas as Receitas</h2>
            <IncomeList incomes={incomes} />
          </Card>
        </div>

        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Despesas
  if (activeSection === 'despesas') {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              Despesas
            </h1>
            <p className="text-muted-foreground mt-1">Controle seus gastos mensais</p>
          </div>

          {/* Card de estatística */}
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <div className="flex items-center gap-4">
              <TrendingDown className="w-10 h-10" />
              <div>
                <p className="text-sm opacity-90">Total do Mês</p>
                <p className="text-3xl font-bold">{formatCurrency(kpis.totalExpenses)}</p>
              </div>
            </div>
          </Card>

          {/* Lista de despesas */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Todas as Despesas</h2>
            <ExpenseList expenses={expenses} />
          </Card>
        </div>

        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Cartões
  if (activeSection === 'cartoes') {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <CreditCardIcon className="w-6 h-6 text-white" />
              </div>
              Cartões de Crédito
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie seus cartões e transações</p>
          </div>

          {/* Grid de Cartões */}
          {cards.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Meus Cartões</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card: any) => (
                  <CreditCardDisplay key={card.id} card={card} />
                ))}
              </div>
            </div>
          ) : (
            <Card className="relative overflow-hidden border-2 border-dashed border-muted">
              <div className="relative p-16 text-center space-y-6">
                <div className="relative inline-block">
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-2xl">
                    <Wallet className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                    <Sparkles className="w-5 h-5 text-yellow-900" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">Comece agora sua jornada financeira</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Adicione seu primeiro cartão de crédito e tenha controle total sobre seus gastos
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  Use o botão <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-bold">+</span> para adicionar
                </p>
              </div>
            </Card>
          )}

          {/* Nova Transação */}
          {cards.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Transação no Cartão
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <CreditCardIcon className="w-5 h-5 text-white" />
                    </div>
                    Nova Transação
                  </DialogTitle>
                </DialogHeader>
                <AddTransactionForm cards={cards} />
              </DialogContent>
            </Dialog>
          )}

          {/* Transações */}
          {transactions.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Últimas Transações</h2>
              <TransactionList transactions={transactions} />
            </Card>
          )}

          {/* Parcelas */}
          {upcomingInstallments.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Próximas Parcelas</h2>
              <InstallmentList installments={upcomingInstallments} />
            </Card>
          )}
        </div>

        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Orçamento
  if (activeSection === 'orcamento') {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Orçamento Mensal</h1>
            <p className="text-muted-foreground">Controle seus limites por categoria</p>
          </div>

          <BudgetManager
            budgets={budgets}
            availableCategories={availableCategories}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
        </div>

        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Categorias
  if (activeSection === 'categorias') {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Categorias</h1>
            <p className="text-muted-foreground">Organize suas receitas e despesas</p>
          </div>

          <CategoryManager categories={categories} />
        </div>

        <FloatingActionButton categories={categories} />
      </>
    )
  }

  return (
    <>
      <div>Seção não encontrada</div>
      <FloatingActionButton categories={categories} />
    </>
  )
}
