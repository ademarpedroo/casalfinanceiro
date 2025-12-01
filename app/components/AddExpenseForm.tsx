'use client'
import { createExpense } from '@/app/actions/expenses'

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

export default function AddExpenseForm({ categories }: { categories: Category[] }) {
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

  return (
    <form action={createExpense} className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
      <h3 className="font-semibold text-lg">Nova Conta a Pagar</h3>
      <input name="description" placeholder="Descrição (ex: Luz)" className="block w-full border p-2 rounded" required />
      <div className="grid grid-cols-2 gap-2">
        <input name="amount" type="number" step="0.01" placeholder="Valor" className="block w-full border p-2 rounded" required />
        <select name="categoryId" className="block w-full border p-2 rounded bg-white">
          <option value="">Sem categoria</option>
          {expenseCategories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>
      <label className="block text-sm text-gray-600">Vencimento</label>
      <input name="dueDate" type="date" className="block w-full border p-2 rounded" required />
      <div className="flex items-center gap-2">
        <input name="isFixed" type="checkbox" className="w-4 h-4" />
        <label className="text-sm">É conta fixa mensal?</label>
      </div>
      <button className="bg-red-600 text-white px-4 py-2 rounded w-full hover:bg-red-500">Cadastrar Conta</button>
    </form>
  )
}
