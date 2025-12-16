'use client'

import { useEffect, useState, useMemo } from 'react'
import KPICards from './KPICards'
import IncomeList from './IncomeList'
import ExpenseList from './ExpenseList'
import IncomeCrud from './IncomeCrud'
import ExpenseCrud from './ExpenseCrud'
import CategoryCrud from './CategoryCrud'
import BudgetCrud from './BudgetCrud'
import CardCrud from './CardCrud'
import FloatingActionButton from './FloatingActionButton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

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

// Tooltip customizado para os gráficos
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

type PeriodFilter = '7d' | '1m' | '3m' | '6m' | '1y' | 'all'

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
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('6m')

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

  // Função para obter a data de corte baseada no filtro
  const getFilterDate = (filter: PeriodFilter): Date => {
    const now = new Date()
    switch (filter) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '1m':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      case '3m':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      case '6m':
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
      case '1y':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      case 'all':
        return new Date(2000, 0, 1)
      default:
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    }
  }

  // Filtrar dados por período
  const filteredIncomes = useMemo(() => {
    const filterDate = getFilterDate(periodFilter)
    return incomes.filter(i => new Date(i.date) >= filterDate)
  }, [incomes, periodFilter])

  const filteredExpenses = useMemo(() => {
    const filterDate = getFilterDate(periodFilter)
    return expenses.filter(e => new Date(e.dueDate) >= filterDate)
  }, [expenses, periodFilter])

  // Gerar dados do gráfico de área baseado nos dados reais
  const areaChartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const now = new Date()

    // Determinar quantos meses mostrar baseado no filtro
    let monthsToShow = 6
    switch (periodFilter) {
      case '7d':
      case '1m':
        monthsToShow = 1
        break
      case '3m':
        monthsToShow = 3
        break
      case '6m':
        monthsToShow = 6
        break
      case '1y':
      case 'all':
        monthsToShow = 12
        break
    }

    const data = []
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()

      const monthIncomes = incomes.filter(inc => {
        const incDate = new Date(inc.date)
        return incDate.getMonth() === month && incDate.getFullYear() === year
      })

      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.dueDate)
        return expDate.getMonth() === month && expDate.getFullYear() === year
      })

      const totalReceitas = monthIncomes.reduce((sum, inc) => sum + inc.amount, 0)
      const totalDespesas = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)

      data.push({
        mes: months[month],
        receitas: totalReceitas,
        despesas: totalDespesas,
      })
    }

    return data
  }, [incomes, expenses, periodFilter])

  // Verificar se há dados reais
  const hasChartData = areaChartData.some(d => d.receitas > 0 || d.despesas > 0)

  // Dashboard Principal
  if (activeSection === 'dashboard' || activeSection === '') {
    // Dados para o gráfico de pizza (despesas por categoria) - dados reais
    const expenseCategories = categories.filter(c => c.type === 'EXPENSE')
    const pieChartData = expenseCategories
      .map(cat => {
        const total = filteredExpenses
          .filter(e => e.categoryId === cat.id)
          .reduce((sum, e) => sum + e.amount, 0)
        return { name: cat.name, value: total, color: cat.color }
      })
      .filter(d => d.value > 0)

    const hasPieData = pieChartData.length > 0

    const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']

    // Dados para o gráfico de barras (orçamento vs gasto) - dados reais
    const budgetChartData = budgets
      .map(b => {
        const cat = categories.find(c => c.id === b.categoryId)
        return {
          categoria: cat?.name?.substring(0, 10) || 'Sem nome',
          limite: b.limit,
          gasto: b.spent || 0,
        }
      })
      .filter(b => b.limite > 0 || b.gasto > 0)
      .slice(0, 5)

    const hasBudgetData = budgetChartData.length > 0

    const periodLabels: Record<PeriodFilter, string> = {
      '7d': '7 dias',
      '1m': '1 mês',
      '3m': '3 meses',
      '6m': '6 meses',
      '1y': '1 ano',
      'all': 'Tudo',
    }

    return (
      <>
        <div className="space-y-6">
          {/* KPI Cards */}
          <KPICards {...kpis} />

          {/* Gráfico Principal - Fluxo de Caixa */}
          <Card className="bg-white shadow-sm border-0 overflow-hidden">
            <div className="p-6 pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Fluxo de Caixa</h3>
                  <p className="text-sm text-gray-500">Receitas vs Despesas</p>
                </div>

                {/* Filtros de Período */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  {(['7d', '1m', '3m', '6m', '1y', 'all'] as PeriodFilter[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => setPeriodFilter(period)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        periodFilter === period
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {periodLabels[period]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legenda */}
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-600">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-gray-600">Despesas</span>
                </div>
              </div>
            </div>

            <div className="h-80 px-2">
              {hasChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="mes"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="receitas"
                      name="Receitas"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorReceitas)"
                    />
                    <Area
                      type="monotone"
                      dataKey="despesas"
                      name="Despesas"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDespesas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="font-medium">Nenhum dado disponível</p>
                  <p className="text-sm">Adicione receitas e despesas para ver o gráfico</p>
                </div>
              )}
            </div>
          </Card>

          {/* Gráficos Secundários */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Despesas por Categoria */}
            <Card className="bg-white shadow-sm border-0 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Despesas por Categoria</h3>
                <p className="text-sm text-gray-500">Distribuição do período selecionado</p>
              </div>
              <div className="h-64">
                {hasPieData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <p className="font-medium text-sm">Sem despesas no período</p>
                  </div>
                )}
              </div>
              {/* Legenda */}
              {hasPieData && (
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {pieChartData.slice(0, 4).map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Orçamento vs Gastos */}
            <Card className="bg-white shadow-sm border-0 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Orçamento vs Gastos</h3>
                <p className="text-sm text-gray-500">Acompanhamento por categoria</p>
              </div>
              <div className="h-64">
                {hasBudgetData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetChartData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                      />
                      <YAxis
                        type="category"
                        dataKey="categoria"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar dataKey="limite" name="Limite" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
                      <Bar dataKey="gasto" name="Gasto" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="font-medium text-sm">Sem orçamentos definidos</p>
                    <p className="text-xs">Configure orçamentos em Orçamento</p>
                  </div>
                )}
              </div>
              {/* Legenda */}
              {hasBudgetData && (
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                    <span className="text-sm text-gray-600">Limite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-sm text-gray-600">Gasto</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Listas de Transações */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-sm border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Últimas Receitas</h3>
                  <p className="text-sm text-gray-500">{incomes.length} registros</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                  <a href="#receitas">Ver todas</a>
                </Button>
              </div>
              <IncomeList incomes={incomes.slice(0, 5)} />
              {incomes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhuma receita cadastrada</p>
                </div>
              )}
            </Card>

            <Card className="bg-white shadow-sm border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Últimas Despesas</h3>
                  <p className="text-sm text-gray-500">{expenses.length} registros</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                  <a href="#despesas">Ver todas</a>
                </Button>
              </div>
              <ExpenseList expenses={expenses.slice(0, 5)} />
              {expenses.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhuma despesa cadastrada</p>
                </div>
              )}
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
        <ExpenseCrud expenses={expenses} categories={categories} cards={cards} transactions={transactions} />
        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Cartões
  if (activeSection === 'cartoes') {
    return (
      <>
        <CardCrud cards={cards} transactions={transactions} />
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
