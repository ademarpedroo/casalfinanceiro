'use client'

import { useState } from 'react'
import { deleteIncome } from '@/app/actions/income'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, TrendingUp, ArrowUpDown } from 'lucide-react'
import Toast from './Toast'

interface Income {
  id: string
  description: string
  amount: number
  date: Date
  category?: {
    name: string
    color: string
    icon: string | null
  } | null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

interface IncomeTableProps {
  incomes: Income[]
  searchFilter?: string
}

export default function IncomeTable({ incomes, searchFilter = '' }: IncomeTableProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortField, setSortField] = useState<'description' | 'amount' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredIncomes = incomes.filter(inc =>
    inc.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    inc.category?.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const sortedIncomes = [...filteredIncomes].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'description':
        comparison = a.description.localeCompare(b.description)
        break
      case 'amount':
        comparison = a.amount - b.amount
        break
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  async function handleDelete(id: string, description: string) {
    if (confirm(`Excluir "${description}"?`)) {
      setLoadingId(id)
      const result = await deleteIncome(id)
      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
      setLoadingId(null)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedIncomes.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(sortedIncomes.map(inc => inc.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  if (sortedIncomes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma receita encontrada</h3>
        <p className="text-gray-500">
          {searchFilter ? 'Tente outro termo de busca' : 'Clique em "Criar Receita" para adicionar'}
        </p>
      </div>
    )
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

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === sortedIncomes.length}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-2 font-medium hover:bg-transparent"
                onClick={() => toggleSort('description')}
              >
                Descricao
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-2 font-medium hover:bg-transparent"
                onClick={() => toggleSort('date')}
              >
                Data
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-2 font-medium hover:bg-transparent"
                onClick={() => toggleSort('amount')}
              >
                Valor
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedIncomes.map((inc) => (
            <TableRow
              key={inc.id}
              className={loadingId === inc.id ? 'opacity-50' : ''}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(inc.id)}
                  onCheckedChange={() => toggleSelect(inc.id)}
                />
              </TableCell>
              <TableCell>
                <span className="font-medium text-green-600 hover:text-green-700 cursor-pointer">
                  {inc.description}
                </span>
              </TableCell>
              <TableCell>
                {inc.category ? (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: `${inc.category.color}15`,
                      color: inc.category.color,
                    }}
                  >
                    {inc.category.icon} {inc.category.name}
                  </Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-gray-600">
                {formatDate(inc.date)}
              </TableCell>
              <TableCell className="font-semibold text-green-600">
                {formatCurrency(inc.amount)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(inc.id, inc.description)}
                  disabled={loadingId === inc.id}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
