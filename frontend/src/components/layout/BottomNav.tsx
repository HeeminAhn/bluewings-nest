'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { id: 'home', icon: Home, label: '홈', path: '/' },
  { id: 'schedule', icon: Calendar, label: '경기', path: '/matches' },
  { id: 'community', icon: MessageSquare, label: '커뮤니티', path: '/posts' },
  { id: 'mypage', icon: User, label: 'MY', path: '/mypage' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/matches')) return 'schedule';
    if (pathname.startsWith('/posts') || pathname.startsWith('/notices')) return 'community';
    if (pathname.startsWith('/mypage')) return 'mypage';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-2 py-1 z-50">
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
