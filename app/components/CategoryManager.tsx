'use client'

import { createCategory, deleteCategory } from '@/app/actions/categories'
import { useState } from 'react'

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [isAdding, setIsAdding] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createCategory(formData)
    e.currentTarget.reset()
    setIsAdding(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteCategory(id)
    }
  }

  const incomeCategories = categories.filter(c => c.type === 'INCOME')
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Categorias</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isAdding ? 'Cancelar' : 'Nova Categoria'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                name="name"
                required
                className="w-full p-2 border rounded"
                placeholder="Ex: Mercado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select name="type" required className="w-full p-2 border rounded">
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Cor</label>
                <input
                  type="color"
                  name="color"
                  defaultValue="#3b82f6"
                  className="w-full h-10 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ícone (emoji)</label>
                <input
                  type="text"
                  name="icon"
                  className="w-full p-2 border rounded"
                  placeholder="🛒"
                  maxLength={2}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Criar Categoria
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-green-600 mb-2">Receitas</h3>
          <div className="space-y-2">
            {incomeCategories.map(cat => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  {cat.icon && <span className="text-xl">{cat.icon}</span>}
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-red-600 mb-2">Despesas</h3>
          <div className="space-y-2">
            {expenseCategories.map(cat => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  {cat.icon && <span className="text-xl">{cat.icon}</span>}
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
