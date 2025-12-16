'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function Navbar({ user }: NavbarProps) {
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-4 bg-white border-b border-gray-100 px-3 sm:px-6 sticky top-0 z-40">
      <SidebarTrigger className="lg:hidden text-gray-600 hover:text-indigo-600 transition-colors flex-shrink-0">
        <Menu className="h-5 w-5" />
      </SidebarTrigger>

      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Usuário'}!
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
            Acompanhe suas finanças em tempo real
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-48 xl:w-64 h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-indigo-50 transition-colors"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-pink-500 rounded-full"></span>
        </Button>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2 pl-2 sm:pl-4 border-l border-gray-200">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-indigo-100">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs sm:text-sm font-medium">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden xl:block">
              <p className="text-sm font-medium text-gray-900">{user.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500">Plano Gratuito</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
