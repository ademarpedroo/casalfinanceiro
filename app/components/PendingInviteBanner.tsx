'use client'

import { useTransition } from 'react'
import { acceptPartnership, rejectPartnership } from '@/app/actions/partnership'

interface PendingInvite {
  id: string
  inviter: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface PendingInviteBannerProps {
  invites: PendingInvite[]
}

export default function PendingInviteBanner({ invites }: PendingInviteBannerProps) {
  const [isPending, startTransition] = useTransition()

  if (invites.length === 0) return null

  const handleAccept = async (inviteId: string) => {
    startTransition(async () => {
      await acceptPartnership(inviteId)
    })
  }

  const handleReject = async (inviteId: string) => {
    startTransition(async () => {
      await rejectPartnership(inviteId)
    })
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl shadow-lg mb-6">
      {invites.map((invite) => (
        <div key={invite.id} className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {invite.inviter.image ? (
              <img src={invite.inviter.image} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {(invite.inviter.name || invite.inviter.email || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold">
                {invite.inviter.name || invite.inviter.email} quer compartilhar dados com voce!
              </p>
              <p className="text-sm text-white/80">
                Aceite para ver despesas, receitas e cartoes em conjunto.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleReject(invite.id)}
              disabled={isPending}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Recusar
            </button>
            <button
              onClick={() => handleAccept(invite.id)}
              disabled={isPending}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              {isPending ? 'Aguarde...' : 'Aceitar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
