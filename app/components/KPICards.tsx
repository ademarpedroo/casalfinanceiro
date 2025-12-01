import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface KPICardsProps {
  totalIncome: number
  totalExpenses: number
  balance: number
  budgetUsage: number
}

export default function KPICards({ totalIncome, totalExpenses, balance, budgetUsage }: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const kpiData = [
    {
      title: 'Total de Receitas',
      value: totalIncome,
      icon: TrendingUp,
      trend: '+15.3%',
      trendUp: true,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Total de Despesas',
      value: totalExpenses,
      icon: TrendingDown,
      trend: '+8.2%',
      trendUp: false,
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Saldo Atual',
      value: balance,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Orçamento Utilizado',
      value: budgetUsage,
      icon: PieChart,
      trend: `${budgetUsage.toFixed(1)}%`,
      trendUp: budgetUsage < 80,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-white/20',
      isPercentage: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => (
        <Card
          key={index}
          className={`${kpi.bgColor} text-white border-0 shadow-lg hover:shadow-xl transition-shadow`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${kpi.iconBg} p-3 rounded-lg`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${
                  kpi.trendUp ? 'bg-white/20' : 'bg-black/20'
                }`}
              >
                {kpi.trend}
              </span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">{kpi.title}</h3>
            <p className="text-2xl font-bold">
              {kpi.isPercentage ? `${kpi.value.toFixed(1)}%` : formatCurrency(kpi.value)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
