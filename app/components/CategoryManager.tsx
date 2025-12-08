'use client'

import { useState, useTransition } from 'react'
import { createCategory, deleteCategory } from '@/app/actions/categories'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, TrendingUp, TrendingDown, Loader2, Tag } from 'lucide-react'
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

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const [selectedIcon, setSelectedIcon] = useState('')
  const [categoryType, setCategoryType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const incomeCategories = categories.filter(c => c.type === 'INCOME')
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

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

  const CategoryTable = ({ items, type }: { items: Category[], type: 'income' | 'expense' }) => {
    const isEmpty = items.length === 0
    const Icon = type === 'income' ? TrendingUp : TrendingDown
    const color = type === 'income' ? 'green' : 'orange'

    if (isEmpty) {
      return (
        <div className="text-center py-12">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-${color}-100 mb-3`}>
            <Tag className={`w-7 h-7 text-${color}-500`} />
          </div>
          <p className="text-gray-500">Nenhuma categoria de {type === 'income' ? 'receita' : 'despesa'}</p>
          <p className="text-gray-400 text-sm mt-1">Clique em "Nova Categoria" para adicionar</p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-16">Ícone</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="w-24">Cor</TableHead>
            <TableHead className="w-20 text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((cat) => (
            <TableRow key={cat.id} className="hover:bg-gray-50/50">
              <TableCell>
                <span className="text-2xl">{cat.icon || '📁'}</span>
              </TableCell>
              <TableCell>
                <span className="font-medium text-gray-800">{cat.name}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full shadow-sm border border-gray-200"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </TableCell>
              <TableCell className="text-right">
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
    )
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
        {/* Header com botão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Gerenciar Categorias</h2>
              <p className="text-sm text-gray-500">{categories.length} categorias cadastradas</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  Nova Categoria
                </DialogTitle>
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
                    placeholder="Ex: Alimentação, Transporte..."
                    required
                    disabled={isPending}
                    className="h-11"
                  />
                </div>

                {/* Ícone */}
                <div className="space-y-2">
                  <Label>Ícone</Label>
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
                  className="w-full h-11 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
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

        {/* Tabs de Categorias */}
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Despesas
              <Badge variant="secondary" className="ml-1">{expenseCategories.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="incomes" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Receitas
              <Badge variant="secondary" className="ml-1">{incomeCategories.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <Card className="overflow-hidden">
              <CategoryTable items={expenseCategories} type="expense" />
            </Card>
          </TabsContent>

          <TabsContent value="incomes">
            <Card className="overflow-hidden">
              <CategoryTable items={incomeCategories} type="income" />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
