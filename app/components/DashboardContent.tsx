'use client'

import { useEffect, useState } from 'react'
import KPICards from './KPICards'
import IncomeList from './IncomeList'
import ExpenseList from './ExpenseList'
import IncomeCrud from './IncomeCrud'
import ExpenseCrud from './ExpenseCrud'
import CategoryCrud from './CategoryCrud'
import BudgetCrud from './BudgetCrud'
import CreditCardDisplay from './CreditCardDisplay'
import TransactionList from './TransactionList'
import InstallmentList from './InstallmentList'
import CardCrud from './CardCrud'
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
                      percent && percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
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
        <IncomeCrud incomes={incomes} categories={categories} />
        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Despesas
  if (activeSection === 'despesas') {
    return (
      <>
        <ExpenseCrud expenses={expenses} categories={categories} />
        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Cartões
  if (activeSection === 'cartoes') {
    return (
      <>
        <CardCrud cards={cards} />
        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Orçamento
  if (activeSection === 'orcamento') {
    return (
      <>
        <BudgetCrud
          budgets={budgets}
          availableCategories={availableCategories}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Categorias
  if (activeSection === 'categorias') {
    return (
      <>
        <CategoryCrud categories={categories} />
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
