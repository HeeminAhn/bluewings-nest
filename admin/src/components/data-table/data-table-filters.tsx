'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface FilterField {
  id: string
  label: string
  type: 'text' | 'date'
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

interface DataTableFiltersProps {
  fields: FilterField[]
  onClear: () => void
}

export function DataTableFilters({ fields, onClear }: DataTableFiltersProps) {
  const hasFilters = fields.some(f => f.value)

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            {field.type === 'text' && field.id.includes('keyword') ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id={field.id}
                  type="text"
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            ) : (
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            필터 초기화
          </Button>
        </div>
      )}
    </div>
  )
}
