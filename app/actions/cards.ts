'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { addMonths, setDate, startOfDay, parseISO } from 'date-fns'

// --- Credit Card Management ---

export async function createCard(data: FormData) {
  const name = data.get('name') as string
  const limit = parseFloat(data.get('limit') as string)
  const closingDay = parseInt(data.get('closingDay') as string)
  const dueDay = parseInt(data.get('dueDay') as string)

  await prisma.creditCard.create({
    data: {
      name,
      limit,
      closingDay,
      dueDay
    }
  })
  revalidatePath('/')
}

export async function getCards() {
  return await prisma.creditCard.findMany({
    include: { transactions: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateCard(id: string, data: FormData) {
  const name = data.get('name') as string
  const limit = parseFloat(data.get('limit') as string)
  const closingDay = parseInt(data.get('closingDay') as string)
  const dueDay = parseInt(data.get('dueDay') as string)

  await prisma.creditCard.update({
    where: { id },
    data: {
      name,
      limit,
      closingDay,
      dueDay
    }
  })
  revalidatePath('/')
}

export async function deleteCard(id: string) {
  // This will cascade delete all transactions and installments
  await prisma.creditCard.delete({
    where: { id }
  })
  revalidatePath('/')
}

// --- Transaction & Installment Logic ---

export async function createTransaction(data: FormData) {
  const cardId = data.get('cardId') as string
  const description = data.get('description') as string
  const amount = parseFloat(data.get('amount') as string)
  const installments = parseInt(data.get('installments') as string)
  const purchaseDateRaw = data.get('purchaseDate') as string // YYYY-MM-DD

  const purchaseDate = startOfDay(parseISO(purchaseDateRaw))

  // 1. Get Card Details
  const card = await prisma.creditCard.findUnique({ where: { id: cardId } })
  if (!card) throw new Error('Card not found')

  // 2. Calculate First Due Date
  // Determine "Billing Cycle Closing Date" for the purchase.
  let billingCycleClosingDate = setDate(purchaseDate, card.closingDay)
  
  // If purchase is AFTER closing day, it belongs to the NEXT billing cycle.
  if (purchaseDate.getDate() > card.closingDay) {
     billingCycleClosingDate = addMonths(billingCycleClosingDate, 1)
  }

  // Now calculate the Due Date relative to that Closing Date.
  let firstDueDate = setDate(billingCycleClosingDate, card.dueDay)
  
  // If Due Day is smaller than Closing Day (e.g. Close 25th, Due 5th), 
  // it means the Due Date is in the following month.
  if (card.dueDay < card.closingDay) {
      firstDueDate = addMonths(firstDueDate, 1)
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
  // Adjust last installment for rounding differences if needed? 
  // For simplicity V1: just standard division.
  
  for (let i = 0; i < installments; i++) {
    const dueDate = addMonths(firstDueDate, i)
    await prisma.installment.create({
      data: {
        transactionId: transaction.id,
        number: i + 1,
        amount: installmentAmount,
        dueDate
      }
    })
  }

  revalidatePath('/')
}

export async function getUpcomingInstallments() {
    const today = startOfDay(new Date())
    return await prisma.installment.findMany({
        where: {
            dueDate: {
                gte: today
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
  // This will cascade delete all installments
  await prisma.cardTransaction.delete({
    where: { id }
  })
  revalidatePath('/')
}

export async function getTransactions() {
  return await prisma.cardTransaction.findMany({
    include: {
      card: true,
      installments: true
    },
    orderBy: { purchaseDate: 'desc' }
  })
}
