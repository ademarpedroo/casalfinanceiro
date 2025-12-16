import nodemailer from 'nodemailer'
import { render } from '@react-email/components'
import PartnerInviteEmail from '@/emails/PartnerInviteEmail'
import DueReminderEmail from '@/emails/DueReminderEmail'

// Configuracao do transporter Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Verificar conexao (opcional, para debug)
export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    console.log('✅ Conexao com Gmail estabelecida')
    return true
  } catch (error) {
    console.error('❌ Erro na conexao com Gmail:', error)
    return false
  }
}

// Enviar email de convite de parceiro
export async function sendPartnerInviteEmail({
  to,
  inviterName,
  inviterEmail,
  inviteLink,
}: {
  to: string
  inviterName: string
  inviterEmail: string
  inviteLink: string
}) {
  try {
    const emailHtml = await render(
      PartnerInviteEmail({
        inviterName,
        inviterEmail,
        inviteLink,
      })
    )

    const result = await transporter.sendMail({
      from: `"CasalFinanceiro" <${process.env.GMAIL_USER}>`,
      to,
      subject: `${inviterName} quer compartilhar as financas com voce!`,
      html: emailHtml,
    })

    console.log('📧 Email de convite enviado para:', to)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Erro ao enviar email de convite:', error)
    return { success: false, error }
  }
}

// Enviar email de lembrete de vencimento
interface DueItem {
  description: string
  amount: number
  dueDate: string
  type: 'expense' | 'card'
  cardName?: string
}

export async function sendDueReminderEmail({
  to,
  userName,
  items,
  totalAmount,
  dashboardLink,
}: {
  to: string
  userName: string
  items: DueItem[]
  totalAmount: number
  dashboardLink: string
}) {
  try {
    const emailHtml = await render(
      DueReminderEmail({
        userName,
        items,
        totalAmount,
        dashboardLink,
      })
    )

    const itemCount = items.length
    const subject = `🔔 ${itemCount} ${itemCount === 1 ? 'conta vence' : 'contas vencem'} em breve - R$ ${totalAmount.toFixed(2)}`

    const result = await transporter.sendMail({
      from: `"CasalFinanceiro" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: emailHtml,
    })

    console.log('📧 Email de lembrete enviado para:', to)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Erro ao enviar email de lembrete:', error)
    return { success: false, error }
  }
}

// Enviar email generico (para outros casos)
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
  try {
    const result = await transporter.sendMail({
      from: `"CasalFinanceiro" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    })

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)
    return { success: false, error }
  }
}
