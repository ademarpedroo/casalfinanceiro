'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { incomeSchema, parseFormData } from '@/lib/validations'
import { auth } from '@/auth'
import { getPartnerIds } from './partnership'

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

  const partnerIds = await getPartnerIds()

  return await prisma.income.findMany({
    where: { userId: { in: partnerIds } },
    include: {
      category: true,
      user: { select: { id: true, name: true, image: true } }
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

    // Somente o dono pode editar
    const income = await prisma.income.findUnique({ where: { id } })
    if (!income || income.userId !== session.user.id) {
      return { success: false, error: 'Voce so pode editar suas proprias receitas' }
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

    // Somente o dono pode excluir
    const income = await prisma.income.findUnique({ where: { id } })
    if (!income || income.userId !== session.user.id) {
      return { success: false, error: 'Voce so pode excluir suas proprias receitas' }
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

export async function createRecurringIncome(data: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Voce precisa estar logado' }
    }

    const result = parseFormData(data, incomeSchema)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    const monthsStr = data.get('months')
    const months = monthsStr ? parseInt(monthsStr as string, 10) : 12

    if (months < 1 || months > 24) {
      return { success: false, error: 'Numero de meses invalido' }
    }

    const startDate = result.data.date
    const incomesToCreate = []

    for (let i = 0; i < months; i++) {
      const incomeDate = new Date(startDate)
      incomeDate.setMonth(incomeDate.getMonth() + i)

      // Ajusta para o ultimo dia do mes se o dia original nao existir
      // Ex: dia 31 em fevereiro vira dia 28/29
      const originalDay = startDate.getDate()
      const lastDayOfMonth = new Date(incomeDate.getFullYear(), incomeDate.getMonth() + 1, 0).getDate()
      incomeDate.setDate(Math.min(originalDay, lastDayOfMonth))

      incomesToCreate.push({
        userId: session.user.id,
        description: result.data.description,
        amount: result.data.amount,
        date: incomeDate,
        categoryId: result.data.categoryId || null
      })
    }

    await prisma.income.createMany({
      data: incomesToCreate
    })

    revalidatePath('/')
    return { success: true, message: `${months} receitas criadas com sucesso!` }
  } catch (error) {
    console.error('Error creating recurring income:', error)
    return { success: false, error: 'Erro ao criar receitas recorrentes. Tente novamente.' }
  }
}
