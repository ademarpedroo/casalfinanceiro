'use client'

import {
  Home,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PieChart,
  Bookmark,
  Users,
  User,
  Mail,
  LogOut,
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

const menuItems = [
  { title: 'Dashboard', icon: Home, url: '/' },
  { title: 'Receitas', icon: TrendingUp, url: '#receitas' },
  { title: 'Despesas', icon: TrendingDown, url: '#despesas' },
  { title: 'Cartões', icon: CreditCard, url: '#cartoes' },
  { title: 'Orçamento', icon: PieChart, url: '#orcamento' },
  { title: 'Categorias', icon: Bookmark, url: '#categorias' },
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
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          {/* Diamond Logo */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-primary" />
            <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="currentColor" className="text-primary" opacity="0.5" />
          </svg>
          <h1 className="text-xl font-bold text-foreground">CasalFinanceiro</h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-all">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-normal">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs text-muted-foreground font-normal">
            Conta
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-all">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-normal">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-all w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-normal">Sair</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
