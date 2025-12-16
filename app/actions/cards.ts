'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { addMonths, setDate, startOfDay, parseISO } from 'date-fns'
import { auth } from '@/auth'

// --- Credit Card Management ---

export async function createCard(data: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Você precisa estar logado para criar um cartão' }
    }

    const name = data.get('name') as string
    const limit = parseFloat(data.get('limit') as string)
    const closingDay = parseInt(data.get('closingDay') as string)
    const dueDay = parseInt(data.get('dueDay') as string)
    const color = data.get('color') as string || 'nubank'
    const brand = data.get('brand') as string || 'mastercard'
    const lastFourDigits = data.get('lastFourDigits') as string || null

    // Validations
    if (!name || name.trim().length === 0) {
      return { error: 'Nome do cartão é obrigatório' }
    }
    if (isNaN(limit) || limit <= 0) {
      return { error: 'Limite deve ser maior que zero' }
    }
    if (isNaN(closingDay) || closingDay < 1 || closingDay > 31) {
      return { error: 'Dia de fechamento deve ser entre 1 e 31' }
    }
    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      return { error: 'Dia de vencimento deve ser entre 1 e 31' }
    }
    if (lastFourDigits && !/^\d{4}$/.test(lastFourDigits)) {
      return { error: 'Últimos 4 dígitos devem conter exatamente 4 números' }
    }

    await prisma.creditCard.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        limit,
        closingDay,
        dueDay,
        color,
        brand,
        lastFourDigits
      }
    })

    revalidatePath('/')
    return { success: true, message: `Cartão "${name}" cadastrado com sucesso!` }
  } catch (error) {
    console.error('Error creating card:', error)
    return { error: 'Erro ao cadastrar cartão. Tente novamente.' }
  }
}

export async function getCards() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  return await prisma.creditCard.findMany({
    where: { userId: session.user.id },
    include: { transactions: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateCard(id: string, data: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Você precisa estar logado para atualizar um cartão' }
    }

    const name = data.get('name') as string
    const limit = parseFloat(data.get('limit') as string)
    const closingDay = parseInt(data.get('closingDay') as string)
    const dueDay = parseInt(data.get('dueDay') as string)
    const color = data.get('color') as string || 'nubank'
    const brand = data.get('brand') as string || 'mastercard'
    const lastFourDigits = data.get('lastFourDigits') as string || null

    // Validations
    if (!name || name.trim().length === 0) {
      return { error: 'Nome do cartão é obrigatório' }
    }
    if (isNaN(limit) || limit <= 0) {
      return { error: 'Limite deve ser maior que zero' }
    }
    if (isNaN(closingDay) || closingDay < 1 || closingDay > 31) {
      return { error: 'Dia de fechamento deve ser entre 1 e 31' }
    }
    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      return { error: 'Dia de vencimento deve ser entre 1 e 31' }
    }
    if (lastFourDigits && !/^\d{4}$/.test(lastFourDigits)) {
      return { error: 'Últimos 4 dígitos devem conter exatamente 4 números' }
    }

    // Verify card belongs to user
    const card = await prisma.creditCard.findUnique({
      where: { id }
    })

    if (!card || card.userId !== session.user.id) {
      return { error: 'Cartão não encontrado ou você não tem permissão para editá-lo' }
    }

    await prisma.creditCard.update({
      where: { id },
      data: {
        name: name.trim(),
        limit,
        closingDay,
        dueDay,
        color,
        brand,
        lastFourDigits
      }
    })

    revalidatePath('/')
    return { success: true, message: `Cartão "${name}" atualizado com sucesso!` }
  } catch (error) {
    console.error('Error updating card:', error)
    return { error: 'Erro ao atualizar cartão. Tente novamente.' }
  }
}

export async function deleteCard(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Você precisa estar logado para excluir um cartão' }
    }

    // Verify card belongs to user
    const card = await prisma.creditCard.findUnique({
      where: { id }
    })

    if (!card || card.userId !== session.user.id) {
      return { error: 'Cartão não encontrado ou você não tem permissão para excluí-lo' }
    }

    // This will cascade delete all transactions and installments
    await prisma.creditCard.delete({
      where: { id }
    })

    revalidatePath('/')
    return { success: true, message: 'Cartão excluído com sucesso!' }
  } catch (error) {
    console.error('Error deleting card:', error)
    return { error: 'Erro ao excluir cartão. Tente novamente.' }
  }
}

// --- Transaction & Installment Logic ---

export async function createTransaction(data: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Você precisa estar logado para criar uma transação' }
    }

    const cardId = data.get('cardId') as string
    const description = data.get('description') as string
    const amount = parseFloat(data.get('amount') as string)
    const installments = parseInt(data.get('installments') as string)
    const purchaseDateRaw = data.get('purchaseDate') as string // YYYY-MM-DD
    const paidInstallments = parseInt(data.get('paidInstallments') as string) || 0
    const firstInvoiceMonth = data.get('firstInvoiceMonth') ? parseInt(data.get('firstInvoiceMonth') as string) : null
    const firstInvoiceYear = data.get('firstInvoiceYear') ? parseInt(data.get('firstInvoiceYear') as string) : null

    const purchaseDate = startOfDay(parseISO(purchaseDateRaw))

    // 1. Get Card Details and verify ownership
    const card = await prisma.creditCard.findUnique({ where: { id: cardId } })
    if (!card) {
      return { error: 'Cartão não encontrado' }
    }
    if (card.userId !== session.user.id) {
      return { error: 'Você não tem permissão para criar transações neste cartão' }
    }

    // Validar parcelas pagas
    if (paidInstallments >= installments) {
      return { error: 'Parcelas pagas não podem ser maior ou igual ao total' }
    }

    // 2. Calculate First Due Date
    let firstDueDate: Date

    // Se o usuario informou a primeira fatura manualmente, usa ela
    if (firstInvoiceMonth !== null && firstInvoiceYear !== null) {
      firstDueDate = setDate(new Date(firstInvoiceYear, firstInvoiceMonth, 1), card.dueDay)
    } else {
      // Calcula automaticamente baseado na data de compra
      let billingCycleClosingDate = setDate(purchaseDate, card.closingDay)

      // If purchase is AFTER closing day, it belongs to the NEXT billing cycle.
      if (purchaseDate.getDate() > card.closingDay) {
         billingCycleClosingDate = addMonths(billingCycleClosingDate, 1)
      }

      // Now calculate the Due Date relative to that Closing Date.
      firstDueDate = setDate(billingCycleClosingDate, card.dueDay)

      // If Due Day is smaller than Closing Day (e.g. Close 25th, Due 5th),
      // it means the Due Date is in the following month.
      if (card.dueDay < card.closingDay) {
          firstDueDate = addMonths(firstDueDate, 1)
      }
    }

    // Create Transaction
    const transaction = await prisma.cardTransaction.create({
      data: {
        cardId,
        description,
        totalAmount: amount,
        purchaseDate,
        installmentsCount: installments
      }
    })

    // Create Installments
    // We fix the precision to 2 decimals to avoid float errors
    const installmentAmount = parseFloat((amount / installments).toFixed(2))
    // Ajusta a ultima parcela para corrigir arredondamento
    const lastInstallmentAmount = parseFloat((amount - (installmentAmount * (installments - 1))).toFixed(2))

    for (let i = 0; i < installments; i++) {
      const dueDate = addMonths(firstDueDate, i)
      const isAlreadyPaid = i < paidInstallments
      const isLastInstallment = i === installments - 1

      await prisma.installment.create({
        data: {
          transactionId: transaction.id,
          number: i + 1,
          amount: isLastInstallment ? lastInstallmentAmount : installmentAmount,
          dueDate,
          isPaid: isAlreadyPaid,
          paidAt: isAlreadyPaid ? new Date() : null
        }
      })
    }

    const pendingCount = installments - paidInstallments
    const message = paidInstallments > 0
      ? `Compra criada! ${paidInstallments} parcela${paidInstallments > 1 ? 's' : ''} já paga${paidInstallments > 1 ? 's' : ''}, ${pendingCount} pendente${pendingCount > 1 ? 's' : ''}.`
      : 'Transação criada com sucesso!'

    revalidatePath('/')
    return { success: true, message }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return { error: 'Erro ao criar transação. Tente novamente.' }
  }
}

export async function getUpcomingInstallments() {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    const today = startOfDay(new Date())
    return await prisma.installment.findMany({
        where: {
            dueDate: {
                gte: today
            },
            transaction: {
                card: {
                    userId: session.user.id
                }
            }
        },
        include: {
            transaction: {
                include: {
                    card: true
                }
            }
        },
        orderBy: {
            dueDate: 'asc'
        },
        take: 10
    })
}

export async function deleteTransaction(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Você precisa estar logado para excluir uma transação' }
    }

    // Verify transaction belongs to user through card ownership
    const transaction = await prisma.cardTransaction.findUnique({
      where: { id },
      include: { card: true }
    })

    if (!transaction || transaction.card.userId !== session.user.id) {
      return { error: 'Transação não encontrada ou você não tem permissão para excluí-la' }
    }

    // This will cascade delete all installments
    await prisma.cardTransaction.delete({
      where: { id }
    })

    revalidatePath('/')
    return { success: true, message: 'Transação excluída com sucesso!' }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return { error: 'Erro ao excluir transação. Tente novamente.' }
  }
}

export async function getTransactions() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  return await prisma.cardTransaction.findMany({
    where: {
      card: {
        userId: session.user.id
      }
    },
    include: {
      card: true,
      installments: {
        orderBy: { number: 'asc' }
      }
    },
    orderBy: { purchaseDate: 'desc' }
  })
}

export async function markInstallmentAsPaid(installmentId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Você precisa estar logado' }
    }

    // Verify ownership through card
    const installment = await prisma.installment.findUnique({
      where: { id: installmentId },
      include: {
        transaction: {
          include: { card: true }
        }
      }
    })

    if (!installment || installment.transaction.card.userId !== session.user.id) {
      return { error: 'Parcela não encontrada' }
    }

    await prisma.installment.update({
      where: { id: installmentId },
      data: {
        isPaid: true,
        paidAt: new Date()
      }
    })

    revalidatePath('/')
    return { success: true, message: 'Parcela marcada como paga!' }
  } catch (error) {
    console.error('Error marking installment as paid:', error)
    return { error: 'Erro ao marcar parcela como paga' }
  }
}

export async function markInstallmentAsUnpaid(installmentId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Você precisa estar logado' }
    }

    const installment = await prisma.installment.findUnique({
      where: { id: installmentId },
      include: {
        transaction: {
          include: { card: true }
        }
      }
    })

    if (!installment || installment.transaction.card.userId !== session.user.id) {
      return { error: 'Parcela não encontrada' }
    }

    await prisma.installment.update({
      where: { id: installmentId },
      data: {
        isPaid: false,
        paidAt: null
      }
    })

    revalidatePath('/')
    return { success: true, message: 'Parcela desmarcada!' }
  } catch (error) {
    console.error('Error unmarking installment:', error)
    return { error: 'Erro ao desmarcar parcela' }
  }
}

// Update transaction installments (change first invoice date)
export async function updateTransactionInvoice(
  transactionId: string,
  firstInvoiceMonth: number,
  firstInvoiceYear: number,
  paidInstallmentsCount: number
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Você precisa estar logado' }
    }

    // Get transaction with card info
    const transaction = await prisma.cardTransaction.findUnique({
      where: { id: transactionId },
      include: {
        card: true,
        installments: { orderBy: { number: 'asc' } }
      }
    })

    if (!transaction) {
      return { error: 'Transação não encontrada' }
    }

    if (transaction.card.userId !== session.user.id) {
      return { error: 'Você não tem permissão para editar esta transação' }
    }

    const installmentsCount = transaction.installmentsCount

    if (paidInstallmentsCount >= installmentsCount) {
      return { error: 'Parcelas pagas não podem ser maior ou igual ao total' }
    }

    // Calculate new first due date
    const firstDueDate = setDate(
      new Date(firstInvoiceYear, firstInvoiceMonth, 1),
      transaction.card.dueDay
    )

    // Update each installment with new due date and paid status
    for (let i = 0; i < transaction.installments.length; i++) {
      const installment = transaction.installments[i]
      const newDueDate = addMonths(firstDueDate, i)
      const shouldBePaid = i < paidInstallmentsCount

      await prisma.installment.update({
        where: { id: installment.id },
        data: {
          dueDate: newDueDate,
          isPaid: shouldBePaid,
          paidAt: shouldBePaid ? (installment.paidAt || new Date()) : null
        }
      })
    }

    revalidatePath('/')
    return {
      success: true,
      message: `Parcelas atualizadas! Primeira fatura: ${['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][firstInvoiceMonth]} ${firstInvoiceYear}`
    }
  } catch (error) {
    console.error('Error updating transaction:', error)
    return { error: 'Erro ao atualizar transação. Tente novamente.' }
  }
}

// Get card invoice for a specific month/year
export async function getCardInvoice(cardId: string, month: number, year: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const card = await prisma.creditCard.findUnique({
    where: { id: cardId }
  })

  if (!card || card.userId !== session.user.id) {
    return null
  }

  // Get installments that are due in the given month/year for this card
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const installments = await prisma.installment.findMany({
    where: {
      transaction: {
        cardId: cardId
      },
      dueDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      transaction: true
    },
    orderBy: {
      dueDate: 'asc'
    }
  })

  const total = installments.reduce((sum, inst) => sum + inst.amount, 0)
  const totalPaid = installments.filter(i => i.isPaid).reduce((sum, inst) => sum + inst.amount, 0)
  const totalPending = total - totalPaid

  return {
    card,
    month,
    year,
    installments,
    total,
    totalPaid,
    totalPending,
    dueDay: card.dueDay
  }
}
