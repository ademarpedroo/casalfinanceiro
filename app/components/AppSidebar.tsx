'use client'

import {
  Home,
  DollarSign,
  CreditCard,
  PieChart,
  TrendingUp,
  Settings,
  Tag,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    url: '/',
    color: 'text-blue-600',
  },
  {
    title: 'Receitas',
    icon: TrendingUp,
    url: '#receitas',
    color: 'text-green-600',
  },
  {
    title: 'Despesas',
    icon: DollarSign,
    url: '#despesas',
    color: 'text-red-600',
  },
  {
    title: 'Cartões',
    icon: CreditCard,
    url: '#cartoes',
    color: 'text-purple-600',
  },
  {
    title: 'Orçamento',
    icon: PieChart,
    url: '#orcamento',
    color: 'text-orange-600',
  },
  {
    title: 'Categorias',
    icon: Tag,
    url: '#categorias',
    color: 'text-pink-600',
  },
]

const settingsItems = [
  {
    title: 'Configurações',
    icon: Settings,
    url: '#settings',
    color: 'text-gray-600',
  },
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
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
            💰
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CasalFinanceiro
            </h2>
            <p className="text-xs text-muted-foreground">Gestão inteligente</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 py-3 hover:bg-accent rounded-md transition-colors">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 py-3 hover:bg-accent rounded-md transition-colors">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
