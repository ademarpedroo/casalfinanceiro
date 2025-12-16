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
    <header className="flex h-16 shrink-0 items-center gap-4 bg-white border-b border-gray-100 px-6 sticky top-0 z-40">
      <SidebarTrigger className="lg:hidden text-gray-600 hover:text-indigo-600 transition-colors">
        <Menu className="h-5 w-5" />
      </SidebarTrigger>

      <div className="flex items-center gap-4 flex-1">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Usuário'}!
          </h2>
          <p className="text-sm text-gray-500">
            Acompanhe suas finanças em tempo real
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-64 h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-xl hover:bg-indigo-50 transition-colors"
        >
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full"></span>
        </Button>

        {user && (
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
            <Avatar className="h-10 w-10 border-2 border-indigo-100">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-medium">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-900">{user.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500">Plano Gratuito</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
