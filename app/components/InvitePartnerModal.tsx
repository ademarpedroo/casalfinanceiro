'use client'

import { useState, useTransition } from 'react'
import { invitePartner, cancelInvite, removePartnership } from '@/app/actions/partnership'

interface InvitePartnerModalProps {
  isOpen: boolean
  onClose: () => void
  partnership: {
    id: string
    status: string
    inviterId: string
    inviteeId: string | null
    inviteeEmail: string
    inviter: { id: string; name: string | null; email: string | null; image: string | null }
    invitee: { id: string; name: string | null; email: string | null; image: string | null } | null
  } | null
  sentInvites: { id: string; inviteeEmail: string; status: string }[]
  currentUserId: string
}

export default function InvitePartnerModal({
  isOpen,
  onClose,
  partnership,
  sentInvites,
  currentUserId
}: InvitePartnerModalProps) {
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!isOpen) return null

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    startTransition(async () => {
      const result = await invitePartner(email)
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Convite enviado!' })
        setEmail('')
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao enviar convite' })
      }
    })
  }

  const handleCancelInvite = async (inviteId: string) => {
    startTransition(async () => {
      const result = await cancelInvite(inviteId)
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Convite cancelado!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao cancelar convite' })
      }
    })
  }

  const handleRemovePartnership = async (partnershipId: string) => {
    if (!confirm('Tem certeza que deseja encerrar a parceria? Os dados permanecerao com quem os criou.')) {
      return
    }

    startTransition(async () => {
      const result = await removePartnership(partnershipId)
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Parceria encerrada!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao encerrar parceria' })
      }
    })
  }

  const getPartnerInfo = () => {
    if (!partnership) return null
    return partnership.inviterId === currentUserId ? partnership.invitee : partnership.inviter
  }

  const partner = getPartnerInfo()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Parceria</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Parceria ativa */}
        {partnership && partnership.status === 'ACCEPTED' && partner && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-indigo-50 to-pink-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-3">Parceiro(a) atual:</p>
              <div className="flex items-center gap-3">
                {partner.image ? (
                  <img src={partner.image} alt="" className="w-12 h-12 rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold text-lg">
                    {(partner.name || partner.email || 'P').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{partner.name || 'Parceiro(a)'}</p>
                  <p className="text-sm text-gray-500">{partner.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemovePartnership(partnership.id)}
                disabled={isPending}
                className="mt-4 w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isPending ? 'Aguarde...' : 'Encerrar Parceria'}
              </button>
            </div>
          </div>
        )}

        {/* Convites pendentes enviados */}
        {sentInvites.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Convites enviados:</p>
            {sentInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between bg-yellow-50 rounded-lg p-3 mb-2">
                <span className="text-sm text-gray-700">{invite.inviteeEmail}</span>
                <button
                  onClick={() => handleCancelInvite(invite.id)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario de convite (só aparece se não tem parceria) */}
        {!partnership && (
          <form onSubmit={handleInvite}>
            <p className="text-sm text-gray-600 mb-4">
              Convide seu parceiro(a) para compartilhar os dados financeiros.
              Ambos poderao ver e gerenciar despesas, receitas e cartoes.
            </p>
            <div className="mb-4">
              <label htmlFor="partnerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email do parceiro(a)
              </label>
              <input
                type="email"
                id="partnerEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parceiro@email.com"
                required
                disabled={isPending}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isPending || !email}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Enviando...' : 'Enviar Convite'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
