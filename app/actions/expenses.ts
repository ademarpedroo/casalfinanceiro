'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { expenseSchema, parseFormData } from '@/lib/validations'
import { auth } from '@/auth'

export async function createExpense(data: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Voce precisa estar logado' }
    }

    const result = parseFormData(data, expenseSchema)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    await prisma.expense.create({
      data: {
        userId: session.user.id,
        description: result.data.description,
        amount: result.data.amount,
        dueDate: result.data.dueDate,
        categoryId: result.data.categoryId || null,
        isFixed: result.data.isFixed
      }
    })

    revalidatePath('/')
    return { success: true, message: 'Despesa cadastrada com sucesso!' }
  } catch (error) {
    console.error('Error creating expense:', error)
    return { success: false, error: 'Erro ao cadastrar despesa. Tente novamente.' }
  }
}

export async function getExpenses() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  return await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      isPaid: false
    },
    include: {
      category: true
    },
    orderBy: { dueDate: 'asc' }
  })
}

export async function markExpenseAsPaid(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Voce precisa estar logado' }
    }

    // Verify expense belongs to user
    const expense = await prisma.expense.findUnique({ where: { id } })
    if (!expense || expense.userId !== session.user.id) {
      return { success: false, error: 'Despesa nao encontrada' }
    }

    await prisma.expense.update({
      where: { id },
      data: { isPaid: true, paidAt: new Date() }
    })

    revalidatePath('/')
    return { success: true, message: 'Despesa marcada como paga!' }
  } catch (error) {
    console.error('Error marking expense as paid:', error)
    return { success: false, error: 'Erro ao marcar despesa como paga. Tente novamente.' }
  }
}

export async function updateExpense(id: string, data: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Voce precisa estar logado' }
    }

    // Verify expense belongs to user
    const expense = await prisma.expense.findUnique({ where: { id } })
    if (!expense || expense.userId !== session.user.id) {
      return { success: false, error: 'Despesa nao encontrada' }
    }

    const result = parseFormData(data, expenseSchema)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    await prisma.expense.update({
      where: { id },
      data: {
        description: result.data.description,
        amount: result.data.amount,
        dueDate: result.data.dueDate,
        categoryId: result.data.categoryId || null,
        isFixed: result.data.isFixed
      }
    })

    revalidatePath('/')
    return { success: true, message: 'Despesa atualizada com sucesso!' }
  } catch (error) {
    console.error('Error updating expense:', error)
    return { success: false, error: 'Erro ao atualizar despesa. Tente novamente.' }
  }
}

export async function deleteExpense(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Voce precisa estar logado' }
    }

    // Verify expense belongs to user
    const expense = await prisma.expense.findUnique({ where: { id } })
    if (!expense || expense.userId !== session.user.id) {
      return { success: false, error: 'Despesa nao encontrada' }
    }

    await prisma.expense.delete({
      where: { id }
    })

    revalidatePath('/')
    return { success: true, message: 'Despesa excluida com sucesso!' }
  } catch (error) {
    console.error('Error deleting expense:', error)
    return { success: false, error: 'Erro ao excluir despesa. Tente novamente.' }
  }
}

// Busca TODAS as despesas (pagas e nao pagas)
export async function getAllExpenses() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  return await prisma.expense.findMany({
    where: { userId: session.user.id },
    include: {
      category: true
    },
    orderBy: { dueDate: 'desc' }
  })
}

// Busca despesas por periodo
export async function getExpensesByDateRange(startDate: Date, endDate: Date) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  return await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      dueDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      category: true
    },
    orderBy: { dueDate: 'desc' }
  })
}

// Resumo de despesas por categoria (para graficos)
export async function getExpensesCategorySummary(month: number, year: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      dueDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      category: true
    }
  })

  // Agrupa por categoria
  const categoryMap = new Map<string, { name: string, color: string, icon: string | null, total: number, count: number }>()

  expenses.forEach(expense => {
    const key = expense.categoryId || 'sem-categoria'
    const existing = categoryMap.get(key)

    if (existing) {
      existing.total += expense.amount
      existing.count += 1
    } else {
      categoryMap.set(key, {
        name: expense.category?.name || 'Sem Categoria',
        color: expense.category?.color || '#6B7280',
        icon: expense.category?.icon || null,
        total: expense.amount,
        count: 1
      })
    }
  })

  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0)

  return Array.from(categoryMap.entries()).map(([id, data]) => ({
    categoryId: id === 'sem-categoria' ? null : id,
    ...data,
    percentage: totalAll > 0 ? (data.total / totalAll) * 100 : 0
  })).sort((a, b) => b.total - a.total)
}

// Cria despesa rapida (versao simplificada)
export async function createQuickExpense(data: {
  description: string
  amount: number
  date: Date
  categoryId?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Voce precisa estar logado' }
    }

    await prisma.expense.create({
      data: {
        userId: session.user.id,
        description: data.description,
        amount: data.amount,
        dueDate: data.date,
        categoryId: data.categoryId || null,
        isFixed: false,
        isPaid: true,
        paidAt: new Date()
      }
    })

    revalidatePath('/')
    return { success: true, message: 'Gasto cadastrado!' }
  } catch (error) {
    console.error('Error creating quick expense:', error)
    return { success: false, error: 'Erro ao cadastrar gasto.' }
  }
}
