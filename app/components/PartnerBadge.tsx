'use client'

interface PartnerBadgeProps {
  user: {
    id: string
    name: string | null
    image: string | null
  }
  currentUserId: string
  size?: 'sm' | 'md'
}

export default function PartnerBadge({ user, currentUserId, size = 'sm' }: PartnerBadgeProps) {
  const isCurrentUser = user.id === currentUserId
  const displayName = user.name || 'Usuario'
  const initials = displayName.slice(0, 2).toUpperCase()

  const sizeClasses = size === 'sm'
    ? 'w-5 h-5 text-[10px]'
    : 'w-6 h-6 text-xs'

  return (
    <div
      className={`inline-flex items-center gap-1 ${isCurrentUser ? 'text-indigo-600' : 'text-pink-600'}`}
      title={isCurrentUser ? 'Voce' : displayName}
    >
      {user.image ? (
        <img
          src={user.image}
          alt={displayName}
          className={`${sizeClasses} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center font-medium ${
            isCurrentUser
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-pink-100 text-pink-700'
          }`}
        >
          {initials}
        </div>
      )}
    </div>
  )
}
