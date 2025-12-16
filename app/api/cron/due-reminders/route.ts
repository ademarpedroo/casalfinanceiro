import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDueReminderEmail } from '@/lib/email'
import { addDays, startOfDay, endOfDay, format } from 'date-fns'

// Configuracao: quantos dias antes avisar
const DAYS_BEFORE = 3

export async function GET(request: NextRequest) {
  try {
    // Verifica token de autorizacao (para seguranca do cron)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = startOfDay(new Date())
    const targetDate = addDays(today, DAYS_BEFORE)
    const targetStart = startOfDay(targetDate)
    const targetEnd = endOfDay(targetDate)

    console.log(`🔔 Buscando contas que vencem em ${format(targetDate, 'dd/MM/yyyy')}...`)

    // Busca todos os usuarios com email
    const users = await prisma.user.findMany({
      where: {
        email: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    let emailsSent = 0
    let errors = 0

    for (const user of users) {
      if (!user.email) continue

      // Busca despesas do usuario que vencem na data alvo
      const expenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
          isPaid: false,
          dueDate: {
            gte: targetStart,
            lte: targetEnd,
          }
        },
        select: {
          description: true,
          amount: true,
          dueDate: true,
        }
      })

      // Busca parcelas de cartao do usuario que vencem na data alvo
      const installments = await prisma.installment.findMany({
        where: {
          isPaid: false,
          dueDate: {
            gte: targetStart,
            lte: targetEnd,
          },
          transaction: {
            card: {
              userId: user.id
            }
          }
        },
        include: {
          transaction: {
            include: {
              card: true
            }
          }
        }
      })

      // Monta lista de itens
      const items: {
        description: string
        amount: number
        dueDate: string
        type: 'expense' | 'card'
        cardName?: string
      }[] = []

      // Adiciona despesas
      for (const exp of expenses) {
        items.push({
          description: exp.description,
          amount: exp.amount,
          dueDate: format(exp.dueDate, 'dd/MM'),
          type: 'expense',
        })
      }

      // Adiciona parcelas de cartao
      for (const inst of installments) {
        items.push({
          description: `${inst.transaction.description} (${inst.number}/${inst.transaction.installmentsCount})`,
          amount: inst.amount,
          dueDate: format(inst.dueDate, 'dd/MM'),
          type: 'card',
          cardName: inst.transaction.card.name,
        })
      }

      // Se tem itens, envia email
      if (items.length > 0) {
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
        const baseUrl = process.env.NEXTAUTH_URL || 'https://casaldev.com.br'

        const result = await sendDueReminderEmail({
          to: user.email,
          userName: user.name || 'Usuario',
          items,
          totalAmount,
          dashboardLink: baseUrl,
        })

        if (result.success) {
          emailsSent++
          console.log(`✅ Email enviado para ${user.email} - ${items.length} itens`)
        } else {
          errors++
          console.error(`❌ Erro ao enviar para ${user.email}:`, result.error)
        }
      }
    }

    console.log(`📊 Resumo: ${emailsSent} emails enviados, ${errors} erros`)

    return NextResponse.json({
      success: true,
      message: `Lembretes enviados! ${emailsSent} emails, ${errors} erros`,
      emailsSent,
      errors,
      targetDate: format(targetDate, 'dd/MM/yyyy'),
    })

  } catch (error) {
    console.error('❌ Erro no cron de lembretes:', error)
    return NextResponse.json(
      { error: 'Erro ao processar lembretes' },
      { status: 500 }
    )
  }
}

// Tambem aceita POST para maior flexibilidade
export async function POST(request: NextRequest) {
  return GET(request)
}
