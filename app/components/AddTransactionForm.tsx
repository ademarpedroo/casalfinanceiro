'use client'
import { createTransaction } from '@/app/actions/cards'

export default function AddTransactionForm({ cards }: { cards: any[] }) {
  return (
    <form action={createTransaction} className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
       <h3 className="font-semibold text-lg">Nova Compra (Crédito)</h3>
       <select name="cardId" className="block w-full border p-2 rounded" required>
         <option value="">Selecione o Cartão</option>
         {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
       </select>
       <input name="description" placeholder="Descrição (ex: Geladeira)" className="block w-full border p-2 rounded" required />
       <div className="grid grid-cols-2 gap-2">
         <input name="amount" type="number" step="0.01" placeholder="Valor Total" className="block w-full border p-2 rounded" required />
         <input name="installments" type="number" min="1" defaultValue="1" placeholder="Parcelas" className="block w-full border p-2 rounded" required />
       </div>
       <label className="block text-sm text-gray-600">Data da Compra</label>
       <input name="purchaseDate" type="date" className="block w-full border p-2 rounded" required />
       <button className="bg-indigo-600 text-white px-4 py-2 rounded w-full hover:bg-indigo-500">Lançar Compra</button>
    </form>
  )
}
