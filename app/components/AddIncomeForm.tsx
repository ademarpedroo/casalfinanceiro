'use client'
import { createIncome } from '@/app/actions/income'
import { useTransition, useState } from 'react'
import Toast from './Toast'

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

export default function AddIncomeForm({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const incomeCategories = categories.filter(c => c.type === 'INCOME')

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createIncome(formData)

      if (result?.success) {
        setToast({ message: result.message!, type: 'success' })
        // Reset form
        const form = document.getElementById('income-form') as HTMLFormElement
        form?.reset()
      } else {
        setToast({ message: result?.error || 'Erro desconhecido', type: 'error' })
      }
    })
  }

  return (
    <>
      <form id="income-form" action={handleSubmit} className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
        <h3 className="font-semibold text-lg">Nova Receita</h3>
        <input
          name="description"
          placeholder="Descrição (ex: Salário)"
          className="block w-full border p-2 rounded"
          required
          disabled={isPending}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Valor"
            className="block w-full border p-2 rounded"
            required
            disabled={isPending}
          />
          <select name="categoryId" className="block w-full border p-2 rounded bg-white" disabled={isPending}>
            <option value="">Sem categoria</option>
            {incomeCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
        <label className="block text-sm text-gray-600">Data Recebimento</label>
        <input
          name="date"
          type="date"
          className="block w-full border p-2 rounded"
          required
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Cadastrando...' : 'Cadastrar Receita'}
        </button>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
