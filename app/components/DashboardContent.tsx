'use client'

import { useEffect, useState } from 'react'
import KPICards from './KPICards'
import ModernTransactionTable from './ModernTransactionTable'
import IncomeList from './IncomeList'
import ExpenseList from './ExpenseList'
import CardList from './CardList'
import TransactionList from './TransactionList'
import CategoryManager from './CategoryManager'
import BudgetManager from './BudgetManager'
import InstallmentList from './InstallmentList'
import AddIncomeForm from './AddIncomeForm'
import AddExpenseForm from './AddExpenseForm'
import AddCardForm from './AddCardForm'
import AddTransactionForm from './AddTransactionForm'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'

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

  // Dashboard Principal - APENAS KPIs e Gráficos
  if (activeSection === 'dashboard' || activeSection === '') {
    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <KPICards {...kpis} />

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gráfico de Receitas vs Despesas */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Receitas vs Despesas</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              [Gráfico de barras aqui - Recharts]
            </div>
          </Card>

          {/* Gráfico de Orçamento */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Orçamento por Categoria</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              [Gráfico de pizza aqui - Recharts]
            </div>
          </Card>
        </div>

        {/* Resumo Rápido */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Últimas Receitas</h3>
              <Button variant="link" asChild>
                <a href="#receitas">Ver todas</a>
              </Button>
            </div>
            <IncomeList incomes={incomes.slice(0, 5)} />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Últimas Despesas</h3>
              <Button variant="link" asChild>
                <a href="#despesas">Ver todas</a>
              </Button>
            </div>
            <ExpenseList expenses={expenses.slice(0, 5)} />
          </Card>
        </div>
      </div>
    )
  }

  // Seção de Receitas
  if (activeSection === 'receitas') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Receitas</h1>
            <p className="text-muted-foreground">Gerencie suas receitas mensais</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
        </div>

        {/* Card com estatísticas */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Total do Mês</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(kpis.totalIncome)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Formulário de cadastro */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Adicionar Nova Receita</h2>
          <AddIncomeForm categories={categories} />
        </Card>

        {/* Lista de receitas */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Todas as Receitas</h2>
          <IncomeList incomes={incomes} />
        </Card>
      </div>
    )
  }

  // Seção de Despesas
  if (activeSection === 'despesas') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Despesas</h1>
            <p className="text-muted-foreground">Controle seus gastos mensais</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </div>

        {/* Card com estatísticas */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Total do Mês</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(kpis.totalExpenses)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Formulário de cadastro */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Adicionar Nova Despesa</h2>
          <AddExpenseForm categories={categories} />
        </Card>

        {/* Lista de despesas */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Todas as Despesas</h2>
          <ExpenseList expenses={expenses} />
        </Card>
      </div>
    )
  }

  // Seção de Cartões
  if (activeSection === 'cartoes') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cartões de Crédito</h1>
            <p className="text-muted-foreground">Gerencie seus cartões e transações</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cartão
          </Button>
        </div>

        {/* Formulário de cadastro de cartão */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Adicionar Novo Cartão</h2>
          <AddCardForm />
        </Card>

        {/* Lista de cartões */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Meus Cartões</h2>
          <CardList cards={cards} />
        </Card>

        {/* Formulário de transação */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Nova Transação</h2>
          <AddTransactionForm cards={cards} />
        </Card>

        {/* Lista de transações */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Todas as Transações</h2>
          <TransactionList transactions={transactions} />
        </Card>

        {/* Próximas parcelas */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Próximas Parcelas (10)</h2>
          <InstallmentList installments={upcomingInstallments} />
        </Card>
      </div>
    )
  }

  // Seção de Orçamento
  if (activeSection === 'orcamento') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orçamento Mensal</h1>
            <p className="text-muted-foreground">Controle seus limites por categoria</p>
          </div>
        </div>

        <BudgetManager
          budgets={budgets}
          availableCategories={availableCategories}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      </div>
    )
  }

  // Seção de Categorias
  if (activeSection === 'categorias') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categorias</h1>
            <p className="text-muted-foreground">Organize suas receitas e despesas</p>
          </div>
        </div>

        <CategoryManager categories={categories} />
      </div>
    )
  }

  return <div>Seção não encontrada</div>
}
