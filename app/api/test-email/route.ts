import { NextRequest, NextResponse } from 'next/server'
import { sendPartnerInviteEmail, sendDueReminderEmail, verifyEmailConnection } from '@/lib/email'

// Rota de teste - REMOVER EM PRODUCAO
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'invite'
  const to = searchParams.get('to')

  if (!to) {
    return NextResponse.json({
      error: 'Informe o email: /api/test-email?to=seu@email.com&type=invite|reminder'
    }, { status: 400 })
  }

  // Verifica conexao
  const connected = await verifyEmailConnection()
  if (!connected) {
    return NextResponse.json({
      error: 'Falha na conexao com Gmail. Verifique GMAIL_USER e GMAIL_APP_PASSWORD'
    }, { status: 500 })
  }

  try {
    if (type === 'invite') {
      // Teste de convite
      const result = await sendPartnerInviteEmail({
        to,
        inviterName: 'Teste CasalFinanceiro',
        inviterEmail: 'teste@casalfinanceiro.com',
        inviteLink: 'https://casaldev.com.br',
      })

      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Email de convite enviado!' : 'Erro ao enviar',
        messageId: result.messageId,
      })

    } else if (type === 'reminder') {
      // Teste de lembrete
      const result = await sendDueReminderEmail({
        to,
        userName: 'Usuario Teste',
        items: [
          { description: 'Conta de Luz', amount: 180.50, dueDate: '20/12', type: 'expense' },
          { description: 'Netflix', amount: 55.90, dueDate: '20/12', type: 'card', cardName: 'Nubank' },
          { description: 'Mercado (2/3)', amount: 250.00, dueDate: '20/12', type: 'card', cardName: 'Inter' },
        ],
        totalAmount: 486.40,
        dashboardLink: 'https://casaldev.com.br',
      })

      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Email de lembrete enviado!' : 'Erro ao enviar',
        messageId: result.messageId,
      })
    }

    return NextResponse.json({ error: 'type deve ser "invite" ou "reminder"' }, { status: 400 })

  } catch (error) {
    console.error('Erro no teste:', error)
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 })
  }
}
