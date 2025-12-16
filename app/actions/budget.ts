'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { startOfMonth, endOfMonth } from 'date-fns'
import { auth } from '@/auth'

export async function createBudget(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Voce precisa estar logado para criar um orcamento' }
    }

    const categoryId = formData.get('categoryId') as string
    const month = parseInt(formData.get('month') as string)
    const year = parseInt(formData.get('year') as string)
    const limit = parseFloat(formData.get('limit') as string)

    if (!categoryId) {
      return { error: 'Selecione uma categoria' }
    }
    if (isNaN(limit) || limit <= 0) {
      return { error: 'Limite deve ser maior que zero' }
    }

    await prisma.budget.create({
      data: {
        userId: session.user.id,
        categoryId,
        month,
        year,
        limit,
      },
    })

    revalidatePath('/')
    return { success: true, message: 'Orcamento criado com sucesso!' }
  } catch (error) {
    console.error('Error creating budget:', error)
    return { error: 'Erro ao criar orcamento. Tente novamente.' }
  }
}

export async function getBudgets(month?: number, year?: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const currentDate = new Date()
  const targetMonth = month ?? currentDate.getMonth() + 1
  const targetYear = year ?? currentDate.getFullYear()

  const budgets = await prisma.budget.findMany({
    where: {
      userId: session.user.id,
      month: targetMonth,
      year: targetYear,
    },
    include: {
      category: true,
    },
    orderBy: {
      category: {
        name: 'asc'
      }
    },
  })

  return budgets
}

export async function getBudgetWithSpent(month?: number, year?: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const currentDate = new Date()
  const targetMonth = month ?? currentDate.getMonth() + 1
  const targetYear = year ?? currentDate.getFullYear()

  const budgets = await getBudgets(targetMonth, targetYear)

  // Calculate spent amount for each budget
  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const monthStart = startOfMonth(new Date(targetYear, targetMonth - 1, 1))
      const monthEnd = endOfMonth(new Date(targetYear, targetMonth - 1, 1))

      const expenses = await prisma.expense.findMany({
        where: {
          userId: session.user.id,
          categoryId: budget.categoryId,
          dueDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })

      const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0

      return {
        ...budget,
        spent,
        percentage,
        remaining: budget.limit - spent,
      }
    })
  )

  return budgetsWithSpent
}

export async function updateBudget(id: string, formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Voce precisa estar logado' }
    }

    const limit = parseFloat(formData.get('limit') as string)

    // Verify budget belongs to user
    const budget = await prisma.budget.findUnique({ where: { id } })
    if (!budget || budget.userId !== session.user.id) {
      return { error: 'Orcamento nao encontrado' }
    }

    await prisma.budget.update({
      where: { id },
      data: { limit },
    })

    revalidatePath('/')
    return { success: true, message: 'Orcamento atualizado!' }
  } catch (error) {
    console.error('Error updating budget:', error)
    return { error: 'Erro ao atualizar orcamento' }
  }
}

export async function deleteBudget(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Voce precisa estar logado' }
    }

    // Verify budget belongs to user
    const budget = await prisma.budget.findUnique({ where: { id } })
    if (!budget || budget.userId !== session.user.id) {
      return { error: 'Orcamento nao encontrado' }
    }

    await prisma.budget.delete({
      where: { id },
    })

    revalidatePath('/')
    return { success: true, message: 'Orcamento excluido!' }
  } catch (error) {
    console.error('Error deleting budget:', error)
    return { error: 'Erro ao excluir orcamento' }
  }
}

export async function getCategoriesWithoutBudget(month: number, year: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  // Get all expense categories for this user
  const allCategories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
      type: 'EXPENSE',
    },
  })

  // Get categories that already have budget for this month/year
  const budgets = await prisma.budget.findMany({
    where: {
      userId: session.user.id,
      month,
      year,
    },
    select: {
      categoryId: true,
    },
  })

  const categoriesWithBudget = budgets.map((b) => b.categoryId)

  // Filter out categories that already have budget
  return allCategories.filter((cat) => !categoriesWithBudget.includes(cat.id))
}
