'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, ChevronDown } from 'lucide-react'

interface Transaction {
  id: string
  description: string
  amount: number
  date: Date
  status: 'success' | 'pending' | 'failed'
}

interface ModernTransactionTableProps {
  transactions: Transaction[]
}

export default function ModernTransactionTable({ transactions }: ModernTransactionTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === transactions.length ? [] : transactions.map((t) => t.id)
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      success: { label: 'Sucesso', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
      failed: { label: 'Falhou', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
    }
    const variant = variants[status] || variants.pending
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Mês <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === transactions.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="border-b last:border-0">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(transaction.id)}
                    onCheckedChange={() => toggleSelection(transaction.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
