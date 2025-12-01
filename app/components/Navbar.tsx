'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Bell, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6 sticky top-0 z-40">
      <SidebarTrigger className="lg:hidden" />

      <div className="flex items-center gap-2 flex-1">
        <div className="relative w-full max-w-md">
          <Input
            type="search"
            placeholder="Buscar transações, categorias..."
            className="w-full bg-muted border-0 pl-4 h-10 rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Mail className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>
        {user && (
          <>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:block">{user.name || 'Usuário'}</span>
          </>
        )}
      </div>
    </header>
  )
}
