'use client'

import { useState, useTransition } from 'react'
import { createCategory, deleteCategory } from '@/app/actions/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Search, TrendingUp, TrendingDown, Loader2, Tag, ArrowUpDown } from 'lucide-react'
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
  const [selectedIds, setSelectedIds] = useState<string[]>([])

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

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCategories.map(c => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
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

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <Tag className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma categoria encontrada</h3>
              <p className="text-gray-500">
                {searchFilter ? 'Tente outro termo de busca' : 'Clique em "Criar Categoria" para adicionar'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredCategories.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-16">Icone</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 -ml-2 font-medium hover:bg-transparent"
                    >
                      Nome
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-24">Cor</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className={deletingId === cat.id ? 'opacity-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(cat.id)}
                        onCheckedChange={() => toggleSelect(cat.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-2xl">{cat.icon || '📁'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-purple-600 hover:text-purple-700 cursor-pointer">
                        {cat.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          cat.type === 'INCOME'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {cat.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full shadow-sm border border-gray-200"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={deletingId === cat.id}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        {deletingId === cat.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  )
}
