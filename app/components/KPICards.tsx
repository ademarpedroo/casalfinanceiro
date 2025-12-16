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
      color: 'text-emerald-600',
      bgIcon: 'bg-emerald-100',
      borderColor: 'border-l-emerald-500',
    },
    {
      title: 'Total de Despesas',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-rose-600',
      bgIcon: 'bg-rose-100',
      borderColor: 'border-l-rose-500',
    },
    {
      title: 'Saldo Atual',
      value: balance,
      icon: DollarSign,
      color: balance >= 0 ? 'text-indigo-600' : 'text-rose-600',
      bgIcon: balance >= 0 ? 'bg-indigo-100' : 'bg-rose-100',
      borderColor: balance >= 0 ? 'border-l-indigo-500' : 'border-l-rose-500',
    },
    {
      title: 'Orçamento Utilizado',
      value: budgetUsage,
      icon: PieChart,
      color: budgetUsage < 80 ? 'text-purple-600' : 'text-amber-600',
      bgIcon: budgetUsage < 80 ? 'bg-purple-100' : 'bg-amber-100',
      borderColor: budgetUsage < 80 ? 'border-l-purple-500' : 'border-l-amber-500',
      isPercentage: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <Card
          key={index}
          className={`bg-white border-l-4 ${kpi.borderColor} shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{kpi.title}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.isPercentage ? `${kpi.value.toFixed(1)}%` : formatCurrency(kpi.value)}
                </p>
              </div>
              <div className={`${kpi.bgIcon} p-3 rounded-xl`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
