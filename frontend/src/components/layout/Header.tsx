'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export function Header({ title, showBack, onBack, rightAction, transparent }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div
      className={`sticky top-0 z-40 ${
        transparent
          ? 'bg-transparent'
          : 'bg-white/90 backdrop-blur-lg border-b border-[#c2c6d3]'
      }`}
      style={{ viewTransitionName: 'header' }}
    >
      {/* 파워 바 */}
      {!transparent && <div className="h-0.5 bg-[#833502]" />}
      <div className="max-w-[1280px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2 text-[#1c1b1b]">
                <ArrowLeft size={24} />
              </Button>
            )}
            <h1
              className={`text-lg font-bold tracking-tight ${transparent ? 'text-white' : 'text-[#1c1b1b]'}`}
            >
              {title}
            </h1>
          </div>
          {rightAction}
        </div>
      </div>
    </div>
  );
}
