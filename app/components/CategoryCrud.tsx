'use client'

import { useState, useTransition } from 'react'
import { createCategory, deleteCategory } from '@/app/actions/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Search, TrendingUp, TrendingDown, Loader2, Tag } from 'lucide-react'
import Toast from './Toast'

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
}

const PRESET_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
]

const PRESET_ICONS = ['🏠', '🍔', '🚗', '💊', '📚', '🎮', '💡', '👕', '💰', '🛒', '✈️', '🎬']

interface CategoryCrudProps {
  categories: Category[]
}

export default function CategoryCrud({ categories }: CategoryCrudProps) {
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const [selectedIcon, setSelectedIcon] = useState('')
  const [categoryType, setCategoryType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all')

  const incomeCategories = categories.filter(c => c.type === 'INCOME')
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

  let filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  if (typeFilter === 'expense') {
    filteredCategories = filteredCategories.filter(c => c.type === 'EXPENSE')
  } else if (typeFilter === 'income') {
    filteredCategories = filteredCategories.filter(c => c.type === 'INCOME')
  }

  const tabs = [
    { value: 'all', label: 'Todas', count: categories.length },
    { value: 'expense', label: 'Despesas', count: expenseCategories.length },
    { value: 'income', label: 'Receitas', count: incomeCategories.length },
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('color', selectedColor)
    formData.set('type', categoryType)
    if (selectedIcon) formData.set('icon', selectedIcon)

    startTransition(async () => {
      const result = await createCategory(formData)
      if (result?.success) {
        setToast({ message: 'Categoria criada!', type: 'success' })
        setIsDialogOpen(false)
        setSelectedIcon('')
      } else {
        setToast({ message: result?.error || 'Erro ao criar', type: 'error' })
      }
    })
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`Excluir categoria "${name}"?`)) {
      setDeletingId(id)
      const result = await deleteCategory(id)
      if (result?.success) {
        setToast({ message: 'Categoria excluída!', type: 'success' })
      } else {
        setToast({ message: result?.error || 'Erro ao excluir', type: 'error' })
      }
      setDeletingId(null)
    }
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

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
              <Badge
                variant="secondary"
                className="text-sm font-medium"
                style={{ backgroundColor: '#8B5CF615', color: '#8B5CF6' }}
              >
                {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">Organize suas receitas e despesas por categoria</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar categorias..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 w-[200px] sm:w-[280px] h-10 border-gray-200"
              />
            </div>

            {/* Create Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="h-10 font-medium"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Criar Categoria</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  {/* Tipo */}
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCategoryType('EXPENSE')}
                        className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                          categoryType === 'EXPENSE'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <TrendingDown className={`w-5 h-5 ${categoryType === 'EXPENSE' ? 'text-orange-500' : 'text-gray-400'}`} />
                        <span className={`font-medium ${categoryType === 'EXPENSE' ? 'text-orange-600' : 'text-gray-600'}`}>
                          Despesa
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryType('INCOME')}
                        className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                          categoryType === 'INCOME'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <TrendingUp className={`w-5 h-5 ${categoryType === 'INCOME' ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={`font-medium ${categoryType === 'INCOME' ? 'text-green-600' : 'text-gray-600'}`}>
                          Receita
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Nome</Label>
                    <Input
                      id="cat-name"
                      name="name"
                      placeholder="Ex: Alimentacao, Transporte..."
                      required
                      disabled={isPending}
                      className="h-11"
                    />
                  </div>

                  {/* Icone */}
                  <div className="space-y-2">
                    <Label>Icone</Label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setSelectedIcon(selectedIcon === icon ? '' : icon)}
                          className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                            selectedIcon === icon
                              ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cor */}
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          style={{ backgroundColor: color }}
                          className={`w-8 h-8 rounded-full transition-all ${
                            selectedColor === color
                              ? 'ring-2 ring-offset-2 ring-purple-500 scale-110'
                              : 'hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedIcon || '📁'}</span>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <span className="font-medium text-gray-700">Nome da Categoria</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-11"
                    style={{ backgroundColor: '#8B5CF6' }}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Categoria
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={typeFilter} onValueChange={(value) => setTypeFilter(value as 'all' | 'expense' | 'income')} className="w-full">
          <TabsList className="bg-gray-100 p-1 h-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                {tab.label}
                <span className="ml-2 text-gray-500">{tab.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Cards Grid */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <Tag className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma categoria encontrada</h3>
            <p className="text-gray-500">
              {searchFilter ? 'Tente outro termo de busca' : 'Clique em "Criar Categoria" para adicionar'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className={`group relative bg-white rounded-xl border-2 border-gray-100 p-4 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer ${
                  deletingId === cat.id ? 'opacity-50' : ''
                }`}
                style={{
                  borderLeftColor: cat.color,
                  borderLeftWidth: '4px',
                }}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(cat.id, cat.name)
                  }}
                  disabled={deletingId === cat.id}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  {cat.icon || '📁'}
                </div>

                {/* Name */}
                <h3 className="font-semibold text-gray-900 truncate mb-1">
                  {cat.name}
                </h3>

                {/* Type badge */}
                <span
                  className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                    cat.type === 'INCOME'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {cat.type === 'INCOME' ? (
                    <>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Receita
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Despesa
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
