import type {ButtonHTMLAttributes, ReactNode} from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const variantClass = variant === 'primary' ? 'toss-button-primary' : 'toss-button-secondary';

  return (
    <button
      className={`toss-button ${variantClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>처리 중...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
