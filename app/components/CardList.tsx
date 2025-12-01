'use client'

import { deleteCard } from '@/app/actions/cards'

interface Card {
  id: string
  name: string
  limit: number
  closingDay: number
  dueDay: number
  transactions?: any[]
}

export default function CardList({ cards }: { cards: Card[] }) {
  async function handleDelete(id: string, name: string) {
    if (confirm(`Tem certeza que deseja excluir o cartão "${name}"? Todas as transações e parcelas serão excluídas também!`)) {
      await deleteCard(id)
    }
  }

  if (cards.length === 0) {
    return <p className="text-gray-500">Nenhum cartão cadastrado.</p>
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <div key={card.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{card.name}</h3>
              <p className="text-sm opacity-90">Limite: R$ {card.limit.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">
                Fechamento: dia {card.closingDay} | Vencimento: dia {card.dueDay}
              </p>
              {card.transactions && card.transactions.length > 0 && (
                <p className="text-xs mt-1 opacity-75">
                  {card.transactions.length} transação(ões)
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(card.id, card.name)}
              className="text-white/80 hover:text-white text-sm bg-red-500/30 px-3 py-1 rounded"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
