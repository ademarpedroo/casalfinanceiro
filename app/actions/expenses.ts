'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { startOfDay } from 'date-fns'
import { expenseSchema, parseFormData } from '@/lib/validations'

export async function createExpense(data: FormData) {
  try {
    const result = parseFormData(data, expenseSchema)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    await prisma.expense.create({
      data: {
        description: result.data.description,
        amount: result.data.amount,
        dueDate: startOfDay(result.data.dueDate),
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
  return await prisma.expense.findMany({
    where: { isPaid: false },
    include: {
      category: true
    },
    orderBy: { dueDate: 'asc' }
  })
}

export async function markExpenseAsPaid(id: string) {
  try {
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
    const result = parseFormData(data, expenseSchema)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    await prisma.expense.update({
      where: { id },
      data: {
        description: result.data.description,
        amount: result.data.amount,
        dueDate: startOfDay(result.data.dueDate),
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
    await prisma.expense.delete({
      where: { id }
    })

    revalidatePath('/')
    return { success: true, message: 'Despesa excluída com sucesso!' }
  } catch (error) {
    console.error('Error deleting expense:', error)
    return { success: false, error: 'Erro ao excluir despesa. Tente novamente.' }
  }
}
