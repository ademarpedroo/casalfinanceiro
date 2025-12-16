'use client'

import {
  Home,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PieChart,
  Bookmark,
  User,
  LogOut,
  Heart,
  FileText,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const menuItems = [
  { title: 'Dashboard', icon: Home, url: '/' },
  { title: 'Receitas', icon: TrendingUp, url: '#receitas' },
  { title: 'Despesas', icon: TrendingDown, url: '#despesas' },
  { title: 'Cartões', icon: CreditCard, url: '#cartoes' },
  { title: 'Orçamento', icon: PieChart, url: '#orcamento' },
  { title: 'Categorias', icon: Bookmark, url: '#categorias' },
  { title: 'Relatórios', icon: FileText, url: '#relatorios' },
]

const accountItems = [
  { title: 'Perfil', icon: User, url: '#profile' },
]

interface AppSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
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
    <Sidebar className="border-r-0 !bg-indigo-600">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          {/* Heart Logo */}
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">CasalFinanceiro</h1>
            <p className="text-xs text-white/60">Gestão a dois</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs text-white/50 font-medium uppercase tracking-wider mb-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-3 text-xs text-white/50 font-medium uppercase tracking-wider mb-2">
            Conta
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all w-full text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Sair</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 px-3 py-3 bg-white/10 rounded-xl backdrop-blur-sm">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name || 'Usuário'}
            </p>
            <p className="text-xs text-white/60 truncate">
              {user.email}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
