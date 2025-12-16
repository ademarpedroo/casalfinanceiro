'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { sendPartnerInviteEmail } from '@/lib/email'

// Convida um parceiro pelo email
export async function invitePartner(email: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Você precisa estar logado' }
    }

    // Não pode convidar a si mesmo
    if (email === session.user.email) {
      return { success: false, error: 'Você não pode convidar a si mesmo' }
    }

    // Verifica se já tem uma parceria ativa
    const existingPartnership = await getActivePartnership()
    if (existingPartnership) {
      return { success: false, error: 'Você já possui uma parceria ativa' }
    }

    // Verifica se já existe um convite pendente para esse email
    const existingInvite = await prisma.partnership.findFirst({
      where: {
        inviterId: session.user.id,
        inviteeEmail: email,
        status: 'PENDING'
      }
    })

    if (existingInvite) {
      return { success: false, error: 'Já existe um convite pendente para esse email' }
    }

    // Busca o usuário convidado (se já existir)
    const invitee = await prisma.user.findUnique({
      where: { email }
    })

    // Cria o convite
    await prisma.partnership.create({
      data: {
        inviterId: session.user.id,
        inviteeId: invitee?.id || null,
        inviteeEmail: email,
        status: 'PENDING'
      }
    })

    // Envia email de convite
    const baseUrl = process.env.NEXTAUTH_URL || 'https://casaldev.com.br'
    const inviteLink = invitee ? baseUrl : `${baseUrl}/login`

    await sendPartnerInviteEmail({
      to: email,
      inviterName: session.user.name || 'Seu parceiro(a)',
      inviterEmail: session.user.email || '',
      inviteLink,
    })

    revalidatePath('/')
    return {
      success: true,
      message: invitee
        ? 'Convite enviado por email! Seu parceiro verá o convite ao entrar no app.'
        : 'Convite enviado por email! Quando a pessoa criar uma conta, verá o convite.'
    }
  } catch (error) {
    console.error('Error inviting partner:', error)
    return { success: false, error: 'Erro ao enviar convite. Tente novamente.' }
  }
}

// Aceita um convite de parceria
export async function acceptPartnership(partnershipId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return { success: false, error: 'Você precisa estar logado' }
    }

    // Busca o convite
    const partnership = await prisma.partnership.findUnique({
      where: { id: partnershipId }
    })

    if (!partnership) {
      return { success: false, error: 'Convite não encontrado' }
    }

    // Verifica se o convite é para o usuário atual
    if (partnership.inviteeEmail !== session.user.email) {
      return { success: false, error: 'Este convite não é para você' }
    }

    if (partnership.status !== 'PENDING') {
      return { success: false, error: 'Este convite já foi processado' }
    }

    // Verifica se o usuário já tem uma parceria ativa
    const existingPartnership = await getActivePartnership()
    if (existingPartnership) {
      return { success: false, error: 'Você já possui uma parceria ativa' }
    }

    // Aceita a parceria
    await prisma.partnership.update({
      where: { id: partnershipId },
      data: {
        inviteeId: session.user.id,
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    })

    // Mesclar categorias duplicadas (opcional, mas útil)
    await mergeDuplicateCategories(session.user.id, partnership.inviterId)

    revalidatePath('/')
    return { success: true, message: 'Parceria aceita! Agora vocês compartilham os dados financeiros.' }
  } catch (error) {
    console.error('Error accepting partnership:', error)
    return { success: false, error: 'Erro ao aceitar convite. Tente novamente.' }
  }
}

// Recusa um convite de parceria
export async function rejectPartnership(partnershipId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return { success: false, error: 'Você precisa estar logado' }
    }

    const partnership = await prisma.partnership.findUnique({
      where: { id: partnershipId }
    })

    if (!partnership) {
      return { success: false, error: 'Convite não encontrado' }
    }

    if (partnership.inviteeEmail !== session.user.email) {
      return { success: false, error: 'Este convite não é para você' }
    }

    await prisma.partnership.update({
      where: { id: partnershipId },
      data: { status: 'REJECTED' }
    })

    revalidatePath('/')
    return { success: true, message: 'Convite recusado.' }
  } catch (error) {
    console.error('Error rejecting partnership:', error)
    return { success: false, error: 'Erro ao recusar convite. Tente novamente.' }
  }
}

// Remove uma parceria existente
export async function removePartnership(partnershipId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Você precisa estar logado' }
    }

    const partnership = await prisma.partnership.findUnique({
      where: { id: partnershipId }
    })

    if (!partnership) {
      return { success: false, error: 'Parceria não encontrada' }
    }

    // Verifica se o usuário faz parte da parceria
    if (partnership.inviterId !== session.user.id && partnership.inviteeId !== session.user.id) {
      return { success: false, error: 'Você não faz parte desta parceria' }
    }

    await prisma.partnership.delete({
      where: { id: partnershipId }
    })

    revalidatePath('/')
    return { success: true, message: 'Parceria encerrada. Os dados permanecem com quem os criou.' }
  } catch (error) {
    console.error('Error removing partnership:', error)
    return { success: false, error: 'Erro ao encerrar parceria. Tente novamente.' }
  }
}

// Cancela um convite pendente (para quem enviou)
export async function cancelInvite(partnershipId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Você precisa estar logado' }
    }

    const partnership = await prisma.partnership.findUnique({
      where: { id: partnershipId }
    })

    if (!partnership) {
      return { success: false, error: 'Convite não encontrado' }
    }

    if (partnership.inviterId !== session.user.id) {
      return { success: false, error: 'Você não pode cancelar este convite' }
    }

    if (partnership.status !== 'PENDING') {
      return { success: false, error: 'Este convite já foi processado' }
    }

    await prisma.partnership.delete({
      where: { id: partnershipId }
    })

    revalidatePath('/')
    return { success: true, message: 'Convite cancelado.' }
  } catch (error) {
    console.error('Error canceling invite:', error)
    return { success: false, error: 'Erro ao cancelar convite. Tente novamente.' }
  }
}

// Retorna a parceria ativa do usuário
export async function getActivePartnership() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const partnership = await prisma.partnership.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { inviterId: session.user.id },
        { inviteeId: session.user.id }
      ]
    },
    include: {
      inviter: {
        select: { id: true, name: true, email: true, image: true }
      },
      invitee: {
        select: { id: true, name: true, email: true, image: true }
      }
    }
  })

  return partnership
}

// Retorna convites pendentes para o usuário atual
export async function getPendingInvites() {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return []
  }

  const invites = await prisma.partnership.findMany({
    where: {
      inviteeEmail: session.user.email,
      status: 'PENDING'
    },
    include: {
      inviter: {
        select: { id: true, name: true, email: true, image: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return invites
}

// Retorna convites enviados pelo usuário atual
export async function getSentInvites() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const invites = await prisma.partnership.findMany({
    where: {
      inviterId: session.user.id,
      status: 'PENDING'
    },
    orderBy: { createdAt: 'desc' }
  })

  return invites
}

// Retorna array de IDs (próprio + parceiro) para filtros
export async function getPartnerIds(): Promise<string[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const partnership = await getActivePartnership()

  if (!partnership) {
    return [session.user.id]
  }

  // Retorna ambos os IDs
  const ids = [partnership.inviterId]
  if (partnership.inviteeId) {
    ids.push(partnership.inviteeId)
  }

  return ids
}

// Retorna informações do parceiro (se houver)
export async function getPartnerInfo() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const partnership = await getActivePartnership()

  if (!partnership) {
    return null
  }

  // Retorna o parceiro (o outro usuário)
  if (partnership.inviterId === session.user.id) {
    return partnership.invitee
  } else {
    return partnership.inviter
  }
}

// Mescla categorias duplicadas quando a parceria é aceita
async function mergeDuplicateCategories(userId1: string, userId2: string) {
  try {
    // Busca categorias de ambos os usuários
    const categories1 = await prisma.category.findMany({
      where: { userId: userId1 }
    })

    const categories2 = await prisma.category.findMany({
      where: { userId: userId2 }
    })

    // Para cada categoria do usuário 2, verifica se existe duplicada no usuário 1
    for (const cat2 of categories2) {
      const duplicate = categories1.find(
        cat1 => cat1.name.toLowerCase() === cat2.name.toLowerCase() && cat1.type === cat2.type
      )

      if (duplicate) {
        // Atualiza referências das despesas/receitas para usar a categoria do usuário 1
        await prisma.expense.updateMany({
          where: { categoryId: cat2.id },
          data: { categoryId: duplicate.id }
        })

        await prisma.income.updateMany({
          where: { categoryId: cat2.id },
          data: { categoryId: duplicate.id }
        })

        await prisma.cardTransaction.updateMany({
          where: { categoryId: cat2.id },
          data: { categoryId: duplicate.id }
        })

        await prisma.budget.updateMany({
          where: { categoryId: cat2.id },
          data: { categoryId: duplicate.id }
        })

        // Remove a categoria duplicada
        await prisma.category.delete({
          where: { id: cat2.id }
        })
      }
    }
  } catch (error) {
    console.error('Error merging categories:', error)
    // Não lança erro, pois a parceria já foi aceita
  }
}
