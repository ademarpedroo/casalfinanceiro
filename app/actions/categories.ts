'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const color = formData.get('color') as string || '#3b82f6'
  const icon = formData.get('icon') as string || null

  await prisma.category.create({
    data: {
      name,
      type,
      color,
      icon,
    },
  })

  revalidatePath('/')
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ],
  })
  return categories
}

export async function getCategoriesByType(type: string) {
  const categories = await prisma.category.findMany({
    where: { type },
    orderBy: { name: 'asc' },
  })
  return categories
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const color = formData.get('color') as string
  const icon = formData.get('icon') as string || null

  await prisma.category.update({
    where: { id },
    data: {
      name,
      color,
      icon,
    },
  })

  revalidatePath('/')
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({
    where: { id },
  })

  revalidatePath('/')
}

// Função para criar categorias padrão para um usuário
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
    { name: 'Salário', type: 'INCOME', color: '#10b981', icon: '💰', userId },
    { name: 'Freelance', type: 'INCOME', color: '#3b82f6', icon: '💼', userId },
    { name: 'Investimentos', type: 'INCOME', color: '#8b5cf6', icon: '📈', userId },
    { name: 'Outros', type: 'INCOME', color: '#6366f1', icon: '💵', userId },

    // Despesas
    { name: 'Moradia', type: 'EXPENSE', color: '#ef4444', icon: '🏠', userId },
    { name: 'Alimentação', type: 'EXPENSE', color: '#f59e0b', icon: '🍽️', userId },
    { name: 'Transporte', type: 'EXPENSE', color: '#06b6d4', icon: '🚗', userId },
    { name: 'Saúde', type: 'EXPENSE', color: '#ec4899', icon: '⚕️', userId },
    { name: 'Educação', type: 'EXPENSE', color: '#8b5cf6', icon: '📚', userId },
    { name: 'Lazer', type: 'EXPENSE', color: '#f43f5e', icon: '🎮', userId },
    { name: 'Contas', type: 'EXPENSE', color: '#64748b', icon: '📄', userId },
    { name: 'Roupas', type: 'EXPENSE', color: '#a855f7', icon: '👕', userId },
    { name: 'Outros', type: 'EXPENSE', color: '#6b7280', icon: '📦', userId },
  ]

  await prisma.category.createMany({
    data: defaultCategories,
  })
}
