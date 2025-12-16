'use client'

import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Tab {
  value: string
  label: string
  count?: number
}

interface CrudLayoutProps {
  title: string
  description?: string
  totalCount: number
  tabs?: Tab[]
  activeTab?: string
  onTabChange?: (value: string) => void
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  createButtonLabel: string
  createForm: ReactNode
  children: ReactNode
  accentColor?: string
  extraFilters?: ReactNode
}

export default function CrudLayout({
  title,
  description,
  totalCount,
  tabs,
  activeTab,
  onTabChange,
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  createButtonLabel,
  createForm,
  children,
  accentColor = '#8B5CF6',
  extraFilters,
}: CrudLayoutProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchValue || '')

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <Badge
              variant="secondary"
              className="text-sm font-medium"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              {totalCount} {totalCount === 1 ? 'item' : 'itens'}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 w-[200px] sm:w-[280px] h-10 border-gray-200"
            />
          </div>

          {/* Create Button */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="h-10 font-medium"
                style={{ backgroundColor: accentColor }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {createButtonLabel}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{createButtonLabel}</DialogTitle>
              </DialogHeader>
              {createForm}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="bg-gray-100 p-1 h-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 text-gray-500">{tab.count}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Extra Filters */}
      {extraFilters}

      {/* Content (Table) */}
      <div className="bg-white rounded-lg border border-gray-200">
        {children}
      </div>
    </div>
  )
}
