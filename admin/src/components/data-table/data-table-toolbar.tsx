'use client'

import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface DataTableToolbarProps {
  searchPlaceholder?: string
  onSearch?: (keyword: string) => void
  children?: React.ReactNode
}

export function DataTableToolbar({
  searchPlaceholder = '검색...',
  onSearch,
  children,
}: DataTableToolbarProps) {
  const [keyword, setKeyword] = useState('')

  const handleSearch = () => {
    onSearch?.(keyword)
  }

  const handleClear = () => {
    setKeyword('')
    onSearch?.('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 pb-4">
      <div className="flex items-center gap-2 flex-1">
        {onSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-9"
            />
            {keyword && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
