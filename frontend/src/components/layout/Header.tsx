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
          : 'bg-white/80 backdrop-blur-lg border-b border-slate-100'
      }`}
      style={{ viewTransitionName: 'header' }}
    >
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
                <ArrowLeft size={24} />
              </Button>
            )}
            <h1
              className={`text-lg font-bold ${transparent ? 'text-white' : 'text-slate-800'}`}
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
