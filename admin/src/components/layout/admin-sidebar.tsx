'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  Calendar,
  MessageSquare,
  MessageCircle,
  Flag,
  History,
  LogOut,
  Shield,
  FolderOpen,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'

const menuItems = [
  {
    title: '대시보드',
    items: [
      { title: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: '회원 관리',
    items: [
      { title: '회원 목록', href: '/members', icon: Users },
    ],
  },
  {
    title: '콘텐츠 관리',
    items: [
      { title: '게시글', href: '/posts', icon: FileText },
      { title: '카테고리', href: '/categories', icon: FolderOpen },
      { title: '공지사항', href: '/notices', icon: Megaphone },
      { title: '경기 일정', href: '/matches', icon: Calendar },
    ],
  },
  {
    title: '커뮤니케이션',
    items: [
      { title: '댓글', href: '/comments', icon: MessageSquare },
      { title: '채팅', href: '/chat', icon: MessageCircle },
    ],
  },
  {
    title: '관리',
    items: [
      { title: '신고', href: '/reports', icon: Flag },
      { title: '접속 이력', href: '/access-logs', icon: History },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">블루윙즈 둥지</span>
            <span className="text-xs text-muted-foreground">관리자</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.nickname}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 hover:bg-accent"
            title="로그아웃"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
