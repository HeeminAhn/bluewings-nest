'use client'

import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const pathTitles: Record<string, string> = {
  dashboard: '대시보드',
  members: '회원 관리',
  posts: '게시글',
  notices: '공지사항',
  matches: '경기 일정',
  comments: '댓글',
  chat: '채팅',
  reports: '신고',
  'access-logs': '접속 이력',
  new: '새로 만들기',
  edit: '수정',
}

export function AdminHeader() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1
            const isId = /^\d+$/.test(segment)
            const title = isId ? `#${segment}` : (pathTitles[segment] || segment)
            const href = '/' + segments.slice(0, index + 1).join('/')

            return (
              <BreadcrumbItem key={segment}>
                {index > 0 && <BreadcrumbSeparator />}
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
