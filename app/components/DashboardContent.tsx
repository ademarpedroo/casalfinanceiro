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
import PendingInviteBanner from './PendingInviteBanner'
import InvitePartnerModal from './InvitePartnerModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  createdAt?: Date
}

interface Partnership {
  id: string
  status: string
  inviterId: string
  inviteeId: string | null
  inviteeEmail: string
  inviter: { id: string; name: string | null; email: string | null; image: string | null }
  invitee: { id: string; name: string | null; email: string | null; image: string | null } | null
}

interface PendingInvite {
  id: string
  inviter: { id: string; name: string | null; email: string | null; image: string | null }
}

interface DashboardContentProps {
  user: User
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
  partnership: Partnership | null
  pendingInvites: PendingInvite[]
  sentInvites: { id: string; inviteeEmail: string; status: string }[]
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

export default function DashboardContent({
  user,
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
  partnership,
  pendingInvites,
  sentInvites,
}: DashboardContentProps) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [showAllTime, setShowAllTime] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [reportView, setReportView] = useState<'planilha' | 'analise'>('planilha')
  const [showPartnerModal, setShowPartnerModal] = useState(false)

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
    setShowAllTime(false)
  }

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
    setShowAllTime(false)
  }

  const goToCurrentMonth = () => {
    setSelectedMonth(currentMonth)
    setSelectedYear(currentYear)
    setShowAllTime(false)
  }

  useEffect(() => {
    const handleHashChange = () => {
      setIsLoading(true)
      const hash = window.location.hash.replace('#', '') || 'dashboard'
      // Pequeno delay para mostrar loading
      setTimeout(() => {
        setActiveSection(hash)
        setIsLoading(false)
      }, 150)
    }

    // Carrega inicial sem loading
    const initialHash = window.location.hash.replace('#', '') || 'dashboard'
    setActiveSection(initialHash)

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Função para obter o intervalo de datas baseada no mês/ano selecionado
  const getFilterDateRange = (): { start: Date; end: Date } => {
    if (showAllTime) {
      return {
        start: new Date(2000, 0, 1),
        end: new Date(2100, 11, 31)
      }
    }

    // Primeiro dia do mês selecionado
    const start = new Date(selectedYear, selectedMonth - 1, 1)
    // Último dia do mês selecionado
    const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59)

    return { start, end }
  }

  // Combinar despesas normais com parcelas de cartao
  const allExpensesWithCards = useMemo(() => {
    // Despesas normais
    const normalExpenses = expenses.map((exp: any) => ({
      id: exp.id,
      description: exp.description,
      amount: exp.amount,
      dueDate: new Date(exp.dueDate),
      isPaid: exp.isPaid || false,
      isCard: false,
      category: exp.category,
      categoryId: exp.categoryId || exp.category?.id,
    }))

    // Parcelas de cartao
    const cardInstallments = transactions.flatMap((t: any) =>
      t.installments.map((inst: any) => ({
        id: `card-${inst.id}`,
        description: `${t.description} (${t.card.name} ${inst.number}/${t.installmentsCount})`,
        amount: inst.amount,
        dueDate: new Date(inst.dueDate),
        isPaid: inst.isPaid || false,
        isCard: true,
        cardName: t.card.name,
        cardColor: t.card.color,
        categoryId: t.categoryId || t.category?.id,
        category: t.category,
      }))
    )

    return [...normalExpenses, ...cardInstallments]
  }, [expenses, transactions])

  // Filtrar dados por período
  const filteredIncomes = useMemo(() => {
    const { start, end } = getFilterDateRange()
    return incomes.filter((i: any) => {
      const date = new Date(i.date)
      const dateMatch = date >= start && date <= end
      const categoryMatch = categoryFilter === 'all' || i.categoryId === categoryFilter
      return dateMatch && categoryMatch
    })
  }, [incomes, selectedMonth, selectedYear, showAllTime, categoryFilter])

  const filteredExpenses = useMemo(() => {
    const { start, end } = getFilterDateRange()
    return allExpensesWithCards.filter(e => {
      const date = new Date(e.dueDate)
      const dateMatch = date >= start && date <= end
      const categoryMatch = categoryFilter === 'all' || e.categoryId === categoryFilter
      return dateMatch && categoryMatch
    })
  }, [allExpensesWithCards, selectedMonth, selectedYear, showAllTime, categoryFilter])

  // KPIs calculados dinamicamente baseado nos dados filtrados
  const filteredKPIs = useMemo(() => {
    const totalIncome = filteredIncomes.reduce((sum: number, inc: any) => sum + inc.amount, 0)
    const totalExpenses = filteredExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const balance = totalIncome - totalExpenses

    // Calcular uso do orcamento baseado nas despesas filtradas
    const budgetUsage = budgets.length > 0
      ? budgets.reduce((sum: number, b: any) => {
          const spent = filteredExpenses
            .filter((e: any) => e.categoryId === b.categoryId)
            .reduce((s: number, e: any) => s + e.amount, 0)
          const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0
          return sum + Math.min(percentage, 100)
        }, 0) / budgets.length
      : 0

    return { totalIncome, totalExpenses, balance, budgetUsage }
  }, [filteredIncomes, filteredExpenses, budgets])

  // Gerar dados do gráfico de área baseado nos dados reais (6 meses antes e depois do selecionado)
  const areaChartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    const data = []
    // 3 meses antes + mes selecionado + 3 meses depois
    for (let i = -3; i <= 3; i++) {
      const date = new Date(selectedYear, selectedMonth - 1 + i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()
      const isSelectedMonth = i === 0

      const monthIncomes = incomes.filter(inc => {
        const incDate = new Date(inc.date)
        return incDate.getMonth() === month && incDate.getFullYear() === year
      })

      const monthExpenses = allExpensesWithCards.filter(exp => {
        const expDate = new Date(exp.dueDate)
        return expDate.getMonth() === month && expDate.getFullYear() === year
      })

      const totalReceitas = monthIncomes.reduce((sum, inc) => sum + inc.amount, 0)
      const totalDespesas = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)

      data.push({
        mes: isSelectedMonth ? `${months[month]}*` : months[month],
        receitas: totalReceitas,
        despesas: totalDespesas,
        isSelectedMonth,
      })
    }

    return data
  }, [incomes, allExpensesWithCards, selectedMonth, selectedYear])

  // Verificar se há dados reais
  const hasChartData = areaChartData.some(d => d.receitas > 0 || d.despesas > 0)

  // Proximos compromissos (despesas futuras nao pagas)
  const upcomingExpenses = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return allExpensesWithCards
      .filter(exp => {
        const dueDate = new Date(exp.dueDate)
        return !exp.isPaid && dueDate >= now
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  }, [allExpensesWithCards])

  // Proximas receitas
  const upcomingIncomes = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return incomes
      .filter(inc => {
        const date = new Date(inc.date)
        return date >= now
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }, [incomes])

  // Total de compromissos futuros
  const totalFutureExpenses = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return allExpensesWithCards
      .filter(exp => !exp.isPaid && new Date(exp.dueDate) >= now)
      .reduce((sum, exp) => sum + exp.amount, 0)
  }, [allExpensesWithCards])

  const totalFutureIncomes = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return incomes
      .filter(inc => new Date(inc.date) >= now)
      .reduce((sum, inc) => sum + inc.amount, 0)
  }, [incomes])

  // Loading component - DEVE vir DEPOIS de todos os hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

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
    // Calcula gastos por categoria baseado nas despesas FILTRADAS
    const budgetChartData = budgets
      .map((b: any) => {
        const cat = categories.find((c: any) => c.id === b.categoryId)
        // Calcula gasto baseado nas despesas filtradas
        const gasto = filteredExpenses
          .filter((e: any) => e.categoryId === b.categoryId)
          .reduce((sum: number, e: any) => sum + e.amount, 0)
        return {
          categoria: cat?.name?.substring(0, 10) || 'Sem nome',
          limite: b.limit,
          gasto,
        }
      })
      .filter((b: any) => b.limite > 0 || b.gasto > 0)
      .slice(0, 5)

    const hasBudgetData = budgetChartData.length > 0

    const isCurrentMonthSelected = selectedMonth === currentMonth && selectedYear === currentYear

    return (
      <>
        <div className="space-y-6">
          {/* Seletor de Mês */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              {/* Navegação de Mês */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 min-w-[180px] justify-center">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span className="font-semibold text-gray-900">
                    {monthNames[selectedMonth - 1]} {selectedYear}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Botão Mês Atual */}
              {!isCurrentMonthSelected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToCurrentMonth}
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  Mês Atual
                </Button>
              )}

              {/* Botão Ver Tudo */}
              <Button
                variant={showAllTime ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowAllTime(!showAllTime)}
                className={showAllTime ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                {showAllTime ? 'Mostrando Tudo' : 'Ver Tudo'}
              </Button>
            </div>

            {/* Filtro de Categoria */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon || '📁'}</span>
                      <span>{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* KPI Cards */}
          <KPICards {...filteredKPIs} />

          {/* Gráfico Principal - Fluxo de Caixa */}
          <Card className="bg-white shadow-sm border-0 overflow-hidden">
            <div className="p-6 pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Fluxo de Caixa</h3>
                  <p className="text-sm text-gray-500">
                    {showAllTime ? 'Histórico completo' : `${monthNames[selectedMonth - 1]} ${selectedYear}`}
                  </p>
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
                <h3 className="text-lg font-semibold text-gray-900">Orcamento vs Gastos</h3>
                <p className="text-sm text-gray-500">Quanto voce planejou gastar vs quanto gastou</p>
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
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 px-4">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="font-medium text-sm text-center">Defina limites de gastos</p>
                    <p className="text-xs text-center mt-1">Va em Orcamento e defina quanto quer gastar por categoria. Ex: Alimentacao R$ 800/mes</p>
                    <a href="#orcamento" className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      Configurar Orcamento →
                    </a>
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

          {/* Projecao Futura */}
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-sm border-0 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Projecao Futura</h3>
                <p className="text-sm text-white/70">Compromissos a partir de hoje</p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-sm text-white/70">Receitas previstas</p>
                  <p className="text-2xl font-bold text-emerald-300">{formatCurrency(totalFutureIncomes)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/70">Despesas previstas</p>
                  <p className="text-2xl font-bold text-rose-300">{formatCurrency(totalFutureExpenses)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/70">Saldo projetado</p>
                  <p className={`text-2xl font-bold ${totalFutureIncomes - totalFutureExpenses >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {formatCurrency(totalFutureIncomes - totalFutureExpenses)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Proximos Compromissos */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-sm border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Proximas Receitas</h3>
                  <p className="text-sm text-gray-500">Receitas agendadas</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-emerald-600 hover:text-emerald-700">
                  <a href="#receitas">Ver todas</a>
                </Button>
              </div>
              {upcomingIncomes.length > 0 ? (
                <div className="space-y-3">
                  {upcomingIncomes.map((inc: any) => (
                    <div key={inc.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div>
                          <p className="font-medium text-gray-900">{inc.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(inc.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-emerald-600">{formatCurrency(inc.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhuma receita futura</p>
                </div>
              )}
            </Card>

            <Card className="bg-white shadow-sm border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Proximas Despesas</h3>
                  <p className="text-sm text-gray-500">Contas a vencer</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-rose-600 hover:text-rose-700">
                  <a href="#despesas">Ver todas</a>
                </Button>
              </div>
              {upcomingExpenses.length > 0 ? (
                <div className="space-y-3">
                  {upcomingExpenses.map((exp: any) => (
                    <div key={exp.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <div>
                          <p className="font-medium text-gray-900">{exp.description}</p>
                          <p className="text-xs text-gray-500">
                            Vence em {new Date(exp.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-rose-600">{formatCurrency(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhuma despesa pendente</p>
                </div>
              )}
            </Card>
          </div>

          {/* Listas de Transações */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-sm border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Receitas do Periodo</h3>
                  <p className="text-sm text-gray-500">{filteredIncomes.length} registros</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                  <a href="#receitas">Ver todas</a>
                </Button>
              </div>
              <IncomeList incomes={filteredIncomes.slice(0, 5)} />
              {filteredIncomes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhuma receita no periodo</p>
                </div>
              )}
            </Card>

            <Card className="bg-white shadow-sm border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Despesas do Periodo</h3>
                  <p className="text-sm text-gray-500">{filteredExpenses.length} registros</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                  <a href="#despesas">Ver todas</a>
                </Button>
              </div>
              <ExpenseList expenses={filteredExpenses.slice(0, 5)} />
              {filteredExpenses.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhuma despesa no periodo</p>
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
        <IncomeCrud incomes={incomes} categories={categories} currentUserId={user.id} />
        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Despesas
  if (activeSection === 'despesas') {
    return (
      <>
        <ExpenseCrud expenses={expenses} categories={categories} cards={cards} transactions={transactions} currentUserId={user.id} />
        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Cartões
  if (activeSection === 'cartoes') {
    return (
      <>
        <CardCrud cards={cards} transactions={transactions} categories={categories} currentUserId={user.id} />
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

  // Seção de Relatórios
  if (activeSection === 'relatorios') {
    // Coletar todos os meses que têm despesas ou transações de cartão
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const monthSet = new Set<string>()

    // Adicionar meses das despesas
    expenses.forEach((exp: any) => {
      const d = new Date(exp.dueDate)
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })

    // Adicionar meses das parcelas de cartão
    transactions.forEach((t: any) => {
      t.installments?.forEach((inst: any) => {
        const d = new Date(inst.dueDate)
        monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
      })
    })

    // Adicionar meses das receitas
    incomes.forEach((inc: any) => {
      const d = new Date(inc.date)
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })

    // Se não houver dados, mostrar os próximos 6 meses
    if (monthSet.size === 0) {
      for (let i = 0; i < 6; i++) {
        const d = new Date(currentYear, currentMonth - 1 + i, 1)
        monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
      }
    }

    // Converter para array e ordenar cronologicamente
    const months = Array.from(monthSet)
      .sort()
      .map(key => {
        const [year, month] = key.split('-').map(Number)
        return {
          month,
          year,
          label: `${monthNames[month - 1]}/${year}`
        }
      })

    // Agrupar despesas fixas e parceladas por descrição/cartão
    const expenseRows: {
      id: string
      description: string
      source: string
      dueDay: number
      isFixed: boolean
      isCard: boolean
      fixedGroupId?: string
      values: { [key: string]: { amount: number; isPaid: boolean; expenseId?: string } }
    }[] = []

    // Despesas normais (fixas e variáveis)
    expenses.forEach((exp: any) => {
      const expDate = new Date(exp.dueDate)
      const mKey = `${expDate.getMonth() + 1}-${expDate.getFullYear()}`

      // Para despesas fixas, agrupa pelo fixedGroupId ou descrição (fallback para despesas antigas)
      // Para despesas não fixas, cada uma é uma linha separada
      let row: typeof expenseRows[0] | undefined

      if (exp.isFixed) {
        // Agrupa despesas fixas pelo fixedGroupId ou descrição
        const groupKey = exp.fixedGroupId || exp.description
        row = expenseRows.find(r =>
          r.isFixed &&
          !r.isCard &&
          (r.fixedGroupId === groupKey || (!r.fixedGroupId && r.description === exp.description))
        )
        if (!row) {
          row = {
            id: `exp-${exp.id}`,
            description: exp.description,
            source: exp.category?.name || 'Geral',
            dueDay: expDate.getDate(),
            isFixed: true,
            isCard: false,
            fixedGroupId: exp.fixedGroupId,
            values: {}
          }
          expenseRows.push(row)
        }
      } else {
        // Despesa não fixa - cada uma é uma linha separada
        row = {
          id: `exp-${exp.id}`,
          description: exp.description,
          source: exp.category?.name || 'Geral',
          dueDay: expDate.getDate(),
          isFixed: false,
          isCard: false,
          values: {}
        }
        expenseRows.push(row)
      }

      // Adiciona o valor no mês correspondente
      row.values[mKey] = { amount: exp.amount, isPaid: exp.isPaid || false, expenseId: exp.id }
    })

    // Transações de cartão (parcelas)
    transactions.forEach((t: any) => {
      t.installments.forEach((inst: any) => {
        const instDate = new Date(inst.dueDate)
        const monthKey = `${instDate.getMonth() + 1}-${instDate.getFullYear()}`

        // Verificar se já existe uma linha para esta transação
        let row = expenseRows.find(r => r.id === `card-${t.id}`)
        if (!row) {
          row = {
            id: `card-${t.id}`,
            description: t.description,
            source: t.card.name,
            dueDay: t.card.dueDay,
            isFixed: false,
            isCard: true,
            values: {}
          }
          expenseRows.push(row)
        }

        row.values[monthKey] = { amount: inst.amount, isPaid: inst.isPaid || false }
      })
    })

    // Calcular totais por mês
    const monthTotals: { [key: string]: { receita: number; despesa: number } } = {}
    months.forEach(m => {
      const mKey = `${m.month}-${m.year}`
      monthTotals[mKey] = { receita: 0, despesa: 0 }

      // Somar receitas do mês
      incomes.forEach((inc: any) => {
        const incDate = new Date(inc.date)
        if (incDate.getMonth() + 1 === m.month && incDate.getFullYear() === m.year) {
          monthTotals[mKey].receita += inc.amount
        }
      })

      // Somar despesas do mês
      expenseRows.forEach(row => {
        if (row.values[mKey]) {
          monthTotals[mKey].despesa += row.values[mKey].amount
        }
      })
    })

    // Dados para visão de análise
    const categoryTotals = categories.map((cat: any) => {
      const incomeTotal = filteredIncomes
        .filter((i: any) => i.categoryId === cat.id)
        .reduce((sum: number, i: any) => sum + i.amount, 0)
      const expenseTotal = filteredExpenses
        .filter((e: any) => e.categoryId === cat.id)
        .reduce((sum: number, e: any) => sum + e.amount, 0)
      return {
        ...cat,
        incomeTotal,
        expenseTotal,
        total: cat.type === 'INCOME' ? incomeTotal : expenseTotal
      }
    }).filter((cat: any) => cat.total > 0)

    const isCurrentMonthSelected = selectedMonth === currentMonth && selectedYear === currentYear

    return (
      <>
        <div className="space-y-6 overflow-x-hidden">
          {/* Header com Tabs */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Relatórios</h2>
                <p className="text-sm sm:text-base text-gray-500">Controle completo das suas finanças</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-full sm:w-auto flex-shrink-0">
                <button
                  onClick={() => setReportView('planilha')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                    reportView === 'planilha'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Planilha
                </button>
                <button
                  onClick={() => setReportView('analise')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                    reportView === 'analise'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Análise
                </button>
              </div>
            </div>
          </div>

          {/* VISÃO: Planilha Mensal */}
          {reportView === 'planilha' && (
            <>
              {/* Tabela Estilo Planilha - Desktop/Tablet */}
              <Card className="bg-white shadow-sm border-0 hidden sm:block overflow-hidden">
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-2 md:p-3 font-semibold text-gray-700 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap">Descrição</th>
                        <th className="text-left p-2 md:p-3 font-semibold text-gray-700 min-w-[90px] md:min-w-[110px] hidden lg:table-cell whitespace-nowrap">Conta/Cartão</th>
                        <th className="text-center p-2 md:p-3 font-semibold text-gray-700 w-14 hidden md:table-cell">Dia</th>
                        {months.map(m => (
                          <th key={`${m.month}-${m.year}`} className="text-right p-2 md:p-3 font-semibold text-gray-700 min-w-[85px] md:min-w-[100px] whitespace-nowrap">
                            {m.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {expenseRows.map((row, idx) => (
                        <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2 md:p-3 font-medium text-gray-900">
                            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                              {row.isCard && <span className="text-[10px] md:text-xs bg-indigo-100 text-indigo-700 px-1 md:px-1.5 py-0.5 rounded whitespace-nowrap">Cartão</span>}
                              {row.isFixed && <span className="text-[10px] md:text-xs bg-blue-100 text-blue-700 px-1 md:px-1.5 py-0.5 rounded whitespace-nowrap">Fixo</span>}
                              <span className="text-xs md:text-sm">{row.description}</span>
                            </div>
                          </td>
                          <td className="p-2 md:p-3 text-gray-600 hidden lg:table-cell text-xs md:text-sm">{row.source}</td>
                          <td className="p-2 md:p-3 text-center text-gray-600 hidden md:table-cell text-xs md:text-sm">{row.dueDay}</td>
                          {months.map(m => {
                            const mKey = `${m.month}-${m.year}`
                            const value = row.values[mKey]
                            return (
                              <td
                                key={mKey}
                                className={`p-2 md:p-3 text-right font-medium text-[11px] md:text-sm whitespace-nowrap ${
                                  value
                                    ? value.isPaid
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-rose-100 text-rose-700'
                                    : 'text-gray-300'
                                }`}
                              >
                                {value ? formatCurrency(value.amount) : '-'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}

                      {expenseRows.length === 0 && (
                        <tr>
                          <td colSpan={3 + months.length} className="p-8 text-center text-gray-400">
                            Nenhuma despesa cadastrada
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {/* Totais */}
                    <tfoot className="border-t-2 border-gray-300">
                      {/* Receita Total */}
                      <tr className="bg-emerald-50">
                        <td colSpan={1} className="p-2 md:p-3 font-bold text-emerald-700 text-xs md:text-sm">
                          RECEITA
                        </td>
                        <td className="hidden lg:table-cell bg-emerald-50"></td>
                        <td className="hidden md:table-cell bg-emerald-50"></td>
                        {months.map(m => {
                          const mKey = `${m.month}-${m.year}`
                          return (
                            <td key={mKey} className="p-2 md:p-3 text-right font-bold text-emerald-700 text-[11px] md:text-sm whitespace-nowrap">
                              {formatCurrency(monthTotals[mKey]?.receita || 0)}
                            </td>
                          )
                        })}
                      </tr>
                      {/* Despesa Total */}
                      <tr className="bg-rose-50">
                        <td colSpan={1} className="p-2 md:p-3 font-bold text-rose-700 text-xs md:text-sm">
                          DESPESA
                        </td>
                        <td className="hidden lg:table-cell bg-rose-50"></td>
                        <td className="hidden md:table-cell bg-rose-50"></td>
                        {months.map(m => {
                          const mKey = `${m.month}-${m.year}`
                          return (
                            <td key={mKey} className="p-2 md:p-3 text-right font-bold text-rose-700 text-[11px] md:text-sm whitespace-nowrap">
                              {formatCurrency(monthTotals[mKey]?.despesa || 0)}
                            </td>
                          )
                        })}
                      </tr>
                      {/* Sobra/Saldo */}
                      <tr className="bg-gray-100">
                        <td colSpan={1} className="p-2 md:p-3 font-bold text-gray-900 text-xs md:text-sm">
                          SOBRA
                        </td>
                        <td className="hidden lg:table-cell bg-gray-100"></td>
                        <td className="hidden md:table-cell bg-gray-100"></td>
                        {months.map(m => {
                          const mKey = `${m.month}-${m.year}`
                          const sobra = (monthTotals[mKey]?.receita || 0) - (monthTotals[mKey]?.despesa || 0)
                          return (
                            <td
                              key={mKey}
                              className={`p-2 md:p-3 text-right font-bold text-[11px] md:text-sm whitespace-nowrap ${
                                sobra >= 0 ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
                              }`}
                            >
                              {formatCurrency(sobra)}
                            </td>
                          )
                        })}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>

              {/* Visão Mobile - Cards por Mês */}
              <div className="sm:hidden space-y-4">
                {/* Resumo Mensal - Cards compactos */}
                <div className="grid grid-cols-3 gap-2">
                  <Card className="bg-emerald-50 p-3 text-center border-0">
                    <p className="text-[10px] text-emerald-600 font-medium">RECEITA</p>
                    <p className="text-sm font-bold text-emerald-700">{formatCurrency(monthTotals[`${months[0]?.month}-${months[0]?.year}`]?.receita || 0)}</p>
                  </Card>
                  <Card className="bg-rose-50 p-3 text-center border-0">
                    <p className="text-[10px] text-rose-600 font-medium">DESPESA</p>
                    <p className="text-sm font-bold text-rose-700">{formatCurrency(monthTotals[`${months[0]?.month}-${months[0]?.year}`]?.despesa || 0)}</p>
                  </Card>
                  <Card className={`p-3 text-center border-0 ${
                    (monthTotals[`${months[0]?.month}-${months[0]?.year}`]?.receita || 0) - (monthTotals[`${months[0]?.month}-${months[0]?.year}`]?.despesa || 0) >= 0
                      ? 'bg-emerald-100' : 'bg-rose-100'
                  }`}>
                    <p className="text-[10px] text-gray-600 font-medium">SOBRA</p>
                    <p className={`text-sm font-bold ${
                      (monthTotals[`${months[0]?.month}-${months[0]?.year}`]?.receita || 0) - (monthTotals[`${months[0]?.month}-${months[0]?.year}`]?.despesa || 0) >= 0
                        ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {formatCurrency((monthTotals[`${months[0]?.month}-${months[0]?.year}`]?.receita || 0) - (monthTotals[`${months[0]?.month}-${months[0]?.year}`]?.despesa || 0))}
                    </p>
                  </Card>
                </div>

                {/* Lista de despesas como cards */}
                <Card className="bg-white shadow-sm border-0 overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b">
                    <h4 className="font-semibold text-gray-700 text-sm">Despesas - {months[0]?.label}</h4>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                    {expenseRows.length === 0 ? (
                      <p className="p-6 text-center text-gray-400 text-sm">Nenhuma despesa cadastrada</p>
                    ) : (
                      expenseRows.map((row) => {
                        const mKey = `${months[0]?.month}-${months[0]?.year}`
                        const value = row.values[mKey]
                        return (
                          <div key={row.id} className="p-3 flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 flex-wrap mb-1">
                                {row.isCard && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded">Cartão</span>}
                                {row.isFixed && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded">Fixo</span>}
                              </div>
                              <p className="font-medium text-gray-900 text-sm truncate">{row.description}</p>
                              <p className="text-xs text-gray-500">{row.source} • Dia {row.dueDay}</p>
                            </div>
                            <div className={`px-2 py-1 rounded text-sm font-semibold whitespace-nowrap ${
                              value
                                ? value.isPaid
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {value ? formatCurrency(value.amount) : '-'}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </Card>

                {/* Scroll horizontal dos meses */}
                <div className="overflow-x-auto -mx-4 px-4 pb-2">
                  <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                    {months.slice(1).map(m => {
                      const mKey = `${m.month}-${m.year}`
                      const receita = monthTotals[mKey]?.receita || 0
                      const despesa = monthTotals[mKey]?.despesa || 0
                      const sobra = receita - despesa
                      return (
                        <Card key={mKey} className="bg-white shadow-sm p-3 min-w-[130px] border-0">
                          <p className="text-xs font-semibold text-gray-700 mb-2">{m.label}</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Receita:</span>
                              <span className="text-emerald-600 font-medium">{formatCurrency(receita)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Despesa:</span>
                              <span className="text-rose-600 font-medium">{formatCurrency(despesa)}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t">
                              <span className="text-gray-700 font-medium">Sobra:</span>
                              <span className={`font-bold ${sobra >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {formatCurrency(sobra)}
                              </span>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Legenda */}
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-emerald-100 border border-emerald-300"></div>
                  <span>Pago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-rose-100 border border-rose-300"></div>
                  <span>Pendente</span>
                </div>
              </div>
            </>
          )}

          {/* VISÃO: Análise por Período */}
          {reportView === 'analise' && (
            <>
              {/* Filtros */}
              <Card className="bg-white shadow-sm border-0 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Filtros</h3>
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                  {/* Navegação de Mês */}
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToPreviousMonth}
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[180px] justify-center">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">
                        {monthNames[selectedMonth - 1]} {selectedYear}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToNextMonth}
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {/* Botão Mês Atual */}
                    {!isCurrentMonthSelected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToCurrentMonth}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm h-8"
                      >
                        Mês Atual
                      </Button>
                    )}

                    {/* Botão Ver Tudo */}
                    <Button
                      variant={showAllTime ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowAllTime(!showAllTime)}
                      className={`text-xs sm:text-sm h-8 ${showAllTime ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                    >
                      {showAllTime ? 'Ver Tudo' : 'Ver Tudo'}
                    </Button>
                  </div>

                  {/* Categoria */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] h-8 sm:h-9 text-sm">
                      <SelectValue placeholder="Todas categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <span>{cat.icon || '📁'}</span>
                            <span>{cat.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Resumo do Período */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <Card className="bg-white shadow-sm border-0 p-3 sm:p-6">
                  <p className="text-[10px] sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Total Receitas</p>
                  <p className="text-sm sm:text-2xl font-bold text-emerald-600">{formatCurrency(filteredKPIs.totalIncome)}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">{filteredIncomes.length} registros</p>
                </Card>
                <Card className="bg-white shadow-sm border-0 p-3 sm:p-6">
                  <p className="text-[10px] sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Total Despesas</p>
                  <p className="text-sm sm:text-2xl font-bold text-rose-600">{formatCurrency(filteredKPIs.totalExpenses)}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">{filteredExpenses.length} registros</p>
                </Card>
                <Card className="bg-white shadow-sm border-0 p-3 sm:p-6">
                  <p className="text-[10px] sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Saldo</p>
                  <p className={`text-sm sm:text-2xl font-bold ${filteredKPIs.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(filteredKPIs.balance)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">
                    {filteredKPIs.balance >= 0 ? 'Superávit' : 'Déficit'}
                  </p>
                </Card>
              </div>

              {/* Totais por Categoria */}
              <Card className="bg-white shadow-sm border-0 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Totais por Categoria</h3>
                {categoryTotals.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {categoryTotals.map((cat: any) => (
                      <div key={cat.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm sm:text-lg flex-shrink-0"
                            style={{ backgroundColor: `${cat.color}20` }}
                          >
                            {cat.icon || '📁'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{cat.name}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">{cat.type === 'INCOME' ? 'Receita' : 'Despesa'}</p>
                          </div>
                        </div>
                        <p className={`text-sm sm:text-lg font-bold flex-shrink-0 ${cat.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(cat.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-6 sm:py-8 text-sm">Nenhum dado no período selecionado</p>
                )}
              </Card>

              {/* Lista de Transações */}
              <Card className="bg-white shadow-sm border-0 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Transações do Período</h3>
                <div className="space-y-1 sm:space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
                  {[...filteredIncomes.map((i: any) => ({ ...i, type: 'income', date: i.date })),
                    ...filteredExpenses.map((e: any) => ({ ...e, type: 'expense', date: e.dueDate }))]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 50)
                    .map((item: any, index: number) => (
                      <div key={`${item.type}-${item.id}-${index}`} className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-100 last:border-0 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm truncate">{item.description}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                              {new Date(item.date).toLocaleDateString('pt-BR')}
                              {item.category && ` • ${item.category.name}`}
                            </p>
                          </div>
                        </div>
                        <p className={`font-semibold text-sm flex-shrink-0 ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                        </p>
                      </div>
                    ))}
                  {filteredIncomes.length === 0 && filteredExpenses.length === 0 && (
                    <p className="text-center text-gray-400 py-6 sm:py-8 text-sm">Nenhuma transação no período</p>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
        <FloatingActionButton categories={categories} />
      </>
    )
  }

  // Seção de Perfil
  if (activeSection === 'profile') {
    const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0)
    const regularExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    // Inclui parcelas de cartão do mês atual
    const cardExpenses = transactions.reduce((sum: number, t: any) => {
      return sum + t.installments.reduce((instSum: number, inst: any) => {
        const dueDate = new Date(inst.dueDate)
        if (dueDate.getMonth() + 1 === currentMonth && dueDate.getFullYear() === currentYear) {
          return instSum + inst.amount
        }
        return instSum
      }, 0)
    }, 0)
    const totalExpenses = regularExpenses + cardExpenses
    const balance = totalIncomes - totalExpenses
    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : 'Data não disponível'

    const userInitials = user.name
      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : user.email?.charAt(0).toUpperCase() || 'U'

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Card do Usuario */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'Avatar'}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <span className="text-gray-500 text-2xl font-semibold">{userInitials}</span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user.name || 'Usuario'}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <p className="text-gray-400 text-xs mt-1">Membro desde {memberSince}</p>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Resumo Financeiro</h3>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-gray-600">Total de Receitas</span>
              <span className="font-medium text-gray-900">{formatCurrency(totalIncomes)}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-gray-600">Total de Despesas</span>
              <span className="font-medium text-gray-900">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
              <span className="text-gray-900 font-medium">Saldo</span>
              <span className={`font-semibold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Estatisticas */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Estatisticas</h3>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-gray-600">Receitas cadastradas</span>
              <span className="font-medium text-gray-900">{incomes.length}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-gray-600">Despesas cadastradas</span>
              <span className="font-medium text-gray-900">{expenses.length}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-gray-600">Compras parceladas</span>
              <span className="font-medium text-gray-900">{transactions.length}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-gray-600">Cartoes cadastrados</span>
              <span className="font-medium text-gray-900">{cards.length}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-gray-600">Categorias</span>
              <span className="font-medium text-gray-900">{categories.length}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Seção de Parceria
  if (activeSection === 'parceria') {
    const getPartnerInfo = () => {
      if (!partnership) return null
      return partnership.inviterId === user.id ? partnership.invitee : partnership.inviter
    }
    const partner = getPartnerInfo()

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Banner de convites pendentes */}
        <PendingInviteBanner invites={pendingInvites} />

        {/* Card Principal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Parceria</h2>

          {partnership && partnership.status === 'ACCEPTED' && partner ? (
            // Parceria ativa
            <div>
              <div className="bg-gradient-to-r from-indigo-50 to-pink-50 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-4 text-center">Voces estao compartilhando dados!</p>
                <div className="flex items-center justify-center gap-6">
                  {/* Usuário atual */}
                  <div className="text-center">
                    {user.image ? (
                      <img src={user.image} alt="" className="w-16 h-16 rounded-full mx-auto mb-2" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center mx-auto mb-2 text-indigo-700 font-bold text-xl">
                        {(user.name || user.email || 'V').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-900">{user.name || 'Voce'}</p>
                  </div>

                  {/* Coração */}
                  <div className="text-pink-500 text-3xl">❤️</div>

                  {/* Parceiro */}
                  <div className="text-center">
                    {partner.image ? (
                      <img src={partner.image} alt="" className="w-16 h-16 rounded-full mx-auto mb-2" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center mx-auto mb-2 text-pink-700 font-bold text-xl">
                        {(partner.name || partner.email || 'P').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-900">{partner.name || 'Parceiro(a)'}</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500 mb-6">
                <p>Todas as despesas, receitas, cartoes e orcamentos sao compartilhados.</p>
                <p>Voces podem ver e gerenciar tudo juntos!</p>
              </div>

              <button
                onClick={() => setShowPartnerModal(true)}
                className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
              >
                Gerenciar Parceria
              </button>
            </div>
          ) : (
            // Sem parceria
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💑</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Convide seu parceiro(a)</h3>
              <p className="text-gray-500 text-sm mb-6">
                Compartilhe suas financas com quem voce ama.<br />
                Ambos poderao ver e gerenciar despesas, receitas e cartoes.
              </p>
              <button
                onClick={() => setShowPartnerModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Convidar Parceiro(a)
              </button>

              {/* Convites enviados pendentes */}
              {sentInvites.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-3">Convites pendentes:</p>
                  {sentInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-gray-700">{invite.inviteeEmail}</span>
                      <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full text-xs">Aguardando</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        <InvitePartnerModal
          isOpen={showPartnerModal}
          onClose={() => setShowPartnerModal(false)}
          partnership={partnership}
          sentInvites={sentInvites}
          currentUserId={user.id || ''}
        />
      </div>
    )
  }

  // Seção não encontrada (fallback)
  return (
    <>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Secao nao encontrada</h2>
          <p className="text-gray-500">A pagina que voce procura nao existe.</p>
        </div>
      </div>
      <FloatingActionButton categories={categories} />
    </>
  )
}
