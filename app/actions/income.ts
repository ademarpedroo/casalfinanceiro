'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { startOfDay } from 'date-fns'
import { incomeSchema, parseFormData } from '@/lib/validations'

export async function createIncome(data: FormData) {
  try {
    const result = parseFormData(data, incomeSchema)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    await prisma.income.create({
      data: {
        description: result.data.description,
        amount: result.data.amount,
        date: startOfDay(result.data.date),
        categoryId: result.data.categoryId || null
      }
    })

    revalidatePath('/')
    return { success: true, message: 'Receita cadastrada com sucesso!' }
  } catch (error) {
    console.error('Error creating income:', error)
    return { success: false, error: 'Erro ao cadastrar receita. Tente novamente.' }
  }
}

export async function getIncomes() {
  return await prisma.income.findMany({
    include: {
      category: true
    },
    orderBy: { date: 'desc' }
  })
}

export async function updateIncome(id: string, data: FormData) {
  try {
    const result = parseFormData(data, incomeSchema)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    await prisma.income.update({
      where: { id },
      data: {
        description: result.data.description,
        amount: result.data.amount,
        date: startOfDay(result.data.date),
        categoryId: result.data.categoryId || null
      }
    })

    revalidatePath('/')
    return { success: true, message: 'Receita atualizada com sucesso!' }
  } catch (error) {
    console.error('Error updating income:', error)
    return { success: false, error: 'Erro ao atualizar receita. Tente novamente.' }
  }
}

export async function deleteIncome(id: string) {
  try {
    await prisma.income.delete({
      where: { id }
    })

    revalidatePath('/')
    return { success: true, message: 'Receita excluída com sucesso!' }
  } catch (error) {
    console.error('Error deleting income:', error)
    return { success: false, error: 'Erro ao excluir receita. Tente novamente.' }
  }
}
