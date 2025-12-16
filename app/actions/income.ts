'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { incomeSchema, parseFormData } from '@/lib/validations'
import { auth } from '@/auth'

export async function createIncome(data: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Voce precisa estar logado' }
    }

    const result = parseFormData(data, incomeSchema)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    await prisma.income.create({
      data: {
        userId: session.user.id,
        description: result.data.description,
        amount: result.data.amount,
        date: result.data.date,
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
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  return await prisma.income.findMany({
    where: { userId: session.user.id },
    include: {
      category: true
    },
    orderBy: { date: 'desc' }
  })
}

export async function updateIncome(id: string, data: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Voce precisa estar logado' }
    }

    // Verify income belongs to user
    const income = await prisma.income.findUnique({ where: { id } })
    if (!income || income.userId !== session.user.id) {
      return { success: false, error: 'Receita nao encontrada' }
    }

    const result = parseFormData(data, incomeSchema)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    await prisma.income.update({
      where: { id },
      data: {
        description: result.data.description,
        amount: result.data.amount,
        date: result.data.date,
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
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Voce precisa estar logado' }
    }

    // Verify income belongs to user
    const income = await prisma.income.findUnique({ where: { id } })
    if (!income || income.userId !== session.user.id) {
      return { success: false, error: 'Receita nao encontrada' }
    }

    await prisma.income.delete({
      where: { id }
    })

    revalidatePath('/')
    return { success: true, message: 'Receita excluida com sucesso!' }
  } catch (error) {
    console.error('Error deleting income:', error)
    return { success: false, error: 'Erro ao excluir receita. Tente novamente.' }
  }
}
