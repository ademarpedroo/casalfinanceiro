'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

export async function createCategory(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Voce precisa estar logado para criar uma categoria' }
    }

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const color = formData.get('color') as string || '#3b82f6'
    const icon = formData.get('icon') as string || null

    if (!name || name.trim().length === 0) {
      return { error: 'Nome da categoria e obrigatorio' }
    }
    if (!type || (type !== 'INCOME' && type !== 'EXPENSE')) {
      return { error: 'Tipo invalido' }
    }

    await prisma.category.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        type,
        color,
        icon,
      },
    })

    revalidatePath('/')
    return { success: true, message: 'Categoria criada com sucesso!' }
  } catch (error) {
    console.error('Error creating category:', error)
    return { error: 'Erro ao criar categoria. Tente novamente.' }
  }
}

export async function getCategories() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ],
  })
  return categories
}

export async function getCategoriesByType(type: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
      type
    },
    orderBy: { name: 'asc' },
  })
  return categories
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Voce precisa estar logado' }
    }

    const name = formData.get('name') as string
    const color = formData.get('color') as string
    const icon = formData.get('icon') as string || null

    // Verify category belongs to user
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category || category.userId !== session.user.id) {
      return { error: 'Categoria nao encontrada' }
    }

    await prisma.category.update({
      where: { id },
      data: {
        name,
        color,
        icon,
      },
    })

    revalidatePath('/')
    return { success: true, message: 'Categoria atualizada!' }
  } catch (error) {
    console.error('Error updating category:', error)
    return { error: 'Erro ao atualizar categoria' }
  }
}

export async function deleteCategory(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Voce precisa estar logado' }
    }

    // Verify category belongs to user
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category || category.userId !== session.user.id) {
      return { error: 'Categoria nao encontrada' }
    }

    await prisma.category.delete({
      where: { id },
    })

    revalidatePath('/')
    return { success: true, message: 'Categoria excluida!' }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { error: 'Erro ao excluir categoria' }
  }
}

// Funcao para criar categorias padrao para um usuario
export async function seedDefaultCategories(userId: string) {
  // Check if user already has categories
  const existingCategories = await prisma.category.count({
    where: { userId }
  })

  if (existingCategories > 0) {
    return // User already has categories
  }

  const defaultCategories = [
    // Receitas
    { name: 'Salario', type: 'INCOME', color: '#10b981', icon: '💰', userId },
    { name: 'Freelance', type: 'INCOME', color: '#3b82f6', icon: '💼', userId },
    { name: 'Investimentos', type: 'INCOME', color: '#8b5cf6', icon: '📈', userId },
    { name: 'Outros', type: 'INCOME', color: '#6366f1', icon: '💵', userId },

    // Despesas
    { name: 'Moradia', type: 'EXPENSE', color: '#ef4444', icon: '🏠', userId },
    { name: 'Alimentacao', type: 'EXPENSE', color: '#f59e0b', icon: '🍽️', userId },
    { name: 'Transporte', type: 'EXPENSE', color: '#06b6d4', icon: '🚗', userId },
    { name: 'Saude', type: 'EXPENSE', color: '#ec4899', icon: '⚕️', userId },
    { name: 'Educacao', type: 'EXPENSE', color: '#8b5cf6', icon: '📚', userId },
    { name: 'Lazer', type: 'EXPENSE', color: '#f43f5e', icon: '🎮', userId },
    { name: 'Contas', type: 'EXPENSE', color: '#64748b', icon: '📄', userId },
    { name: 'Roupas', type: 'EXPENSE', color: '#a855f7', icon: '👕', userId },
    { name: 'Outros', type: 'EXPENSE', color: '#6b7280', icon: '📦', userId },
  ]

  await prisma.category.createMany({
    data: defaultCategories,
  })
}

// Funcao para remover categorias duplicadas
export async function deduplicateCategories(userId: string) {
  // Busca todas as categorias do usuario
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  })

  // Agrupa por nome + tipo
  const grouped: Record<string, typeof categories> = {}
  for (const cat of categories) {
    const key = `${cat.name.toLowerCase()}-${cat.type}`
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(cat)
  }

  // Para cada grupo com duplicatas
  for (const key in grouped) {
    const group = grouped[key]
    if (group.length <= 1) continue

    // Mantém o primeiro (mais antigo), remove os outros
    const [keep, ...duplicates] = group
    const duplicateIds = duplicates.map(d => d.id)

    // Atualiza referencias em Income
    await prisma.income.updateMany({
      where: { categoryId: { in: duplicateIds } },
      data: { categoryId: keep.id }
    })

    // Atualiza referencias em Expense
    await prisma.expense.updateMany({
      where: { categoryId: { in: duplicateIds } },
      data: { categoryId: keep.id }
    })

    // Deleta budgets duplicados (unique constraint: categoryId, month, year)
    await prisma.budget.deleteMany({
      where: { categoryId: { in: duplicateIds } }
    })

    // Deleta categorias duplicadas
    await prisma.category.deleteMany({
      where: { id: { in: duplicateIds } }
    })
  }
}
