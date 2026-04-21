'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'home', icon: Home, label: '홈', path: '/' },
  { id: 'schedule', icon: Calendar, label: '경기', path: '/matches' },
  { id: 'community', icon: MessageSquare, label: '커뮤니티', path: '/posts' },
  { id: 'mypage', icon: User, label: 'MY', path: '/mypage' },
];

// BottomNav를 숨길 페이지 경로
const hiddenPaths = ['/login', '/signup', '/chat'];

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // 특정 페이지에서는 숨김
  const shouldHide = hiddenPaths.some(path => pathname.startsWith(path));
  if (shouldHide) return null;

  const getActiveTab = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/matches')) return 'schedule';
    if (pathname.startsWith('/posts') || pathname.startsWith('/notices')) return 'community';
    if (pathname.startsWith('/mypage')) return 'mypage';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-2 py-1 z-50 md:hidden", className)}>
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
              activeTab === item.id ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <item.icon
              size={22}
              className={activeTab === item.id ? 'fill-blue-700/20' : ''}
            />
            <span className={`text-xs ${activeTab === item.id ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
