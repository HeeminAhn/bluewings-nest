import { Card, CardContent } from '@/components/ui/card'
import { cn, formatNumber } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
}

export function StatCard({ title, value, icon: Icon, iconColor = 'text-white', iconBgColor = 'bg-primary' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{formatNumber(value)}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <div className={cn('rounded-full p-3', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
