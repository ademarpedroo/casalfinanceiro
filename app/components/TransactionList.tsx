'use client'

import { deleteTransaction } from '@/app/actions/cards'

interface Transaction {
  id: string
  description: string
  totalAmount: number
  purchaseDate: Date
  installmentsCount: number
  card: {
    name: string
  }
  installments?: any[]
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  async function handleDelete(id: string, description: string) {
    if (confirm(`Tem certeza que deseja excluir a transação "${description}"? Todas as parcelas serão excluídas também!`)) {
      await deleteTransaction(id)
    }
  }

  if (transactions.length === 0) {
    return <p className="text-gray-500">Nenhuma transação registrada.</p>
  }

  return (
    <div className="space-y-3">
      {transactions.map((trans) => (
        <div key={trans.id} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
          <div className="flex-1">
            <p className="font-medium">{trans.description}</p>
            <p className="text-xs text-gray-500">
              {trans.card.name} • {new Date(trans.purchaseDate).toLocaleDateString()} • {trans.installmentsCount}x
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-blue-600">R$ {trans.totalAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                {trans.installmentsCount}x de R$ {(trans.totalAmount / trans.installmentsCount).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => handleDelete(trans.id, trans.description)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
