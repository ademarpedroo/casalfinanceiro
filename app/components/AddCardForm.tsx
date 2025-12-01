'use client'
import { createCard } from '@/app/actions/cards'

export default function AddCardForm() {
  return (
    <form action={createCard} className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
      <h3 className="font-semibold text-lg">Novo Cartão</h3>
      <input name="name" placeholder="Nome (ex: Nubank)" className="block w-full border p-2 rounded" required />
      <div className="grid grid-cols-3 gap-2">
        <input name="limit" type="number" placeholder="Limite" className="block w-full border p-2 rounded" required />
        <input name="closingDay" type="number" min="1" max="31" placeholder="Dia Fech." className="block w-full border p-2 rounded" required />
        <input name="dueDay" type="number" min="1" max="31" placeholder="Dia Venc." className="block w-full border p-2 rounded" required />
      </div>
      <button className="bg-slate-800 text-white px-4 py-2 rounded w-full hover:bg-slate-700">Cadastrar Cartão</button>
    </form>
  )
}
