'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function createBudget(formData: FormData) {
  const categoryId = formData.get('categoryId') as string
  const month = parseInt(formData.get('month') as string)
  const year = parseInt(formData.get('year') as string)
  const limit = parseFloat(formData.get('limit') as string)

  await prisma.budget.create({
    data: {
      categoryId,
      month,
      year,
      limit,
    },
  })

  revalidatePath('/')
}

export async function getBudgets(month?: number, year?: number) {
  const currentDate = new Date()
  const targetMonth = month ?? currentDate.getMonth() + 1
  const targetYear = year ?? currentDate.getFullYear()

  const budgets = await prisma.budget.findMany({
    where: {
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
  const limit = parseFloat(formData.get('limit') as string)

  await prisma.budget.update({
    where: { id },
    data: { limit },
  })

  revalidatePath('/')
}

export async function deleteBudget(id: string) {
  await prisma.budget.delete({
    where: { id },
  })

  revalidatePath('/')
}

export async function getCategoriesWithoutBudget(month: number, year: number) {
  // Get all expense categories
  const allCategories = await prisma.category.findMany({
    where: {
      type: 'EXPENSE',
    },
  })

  // Get categories that already have budget for this month/year
  const budgets = await prisma.budget.findMany({
    where: {
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
