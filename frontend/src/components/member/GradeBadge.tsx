import { Award, Star, Flame, Shield, Crown } from 'lucide-react';
import type { MemberGrade } from '../../types';
import { GRADE_INFO } from '../../types';

interface GradeBadgeProps {
  grade: MemberGrade;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const GRADE_ICONS: Record<MemberGrade, typeof Award> = {
  ROOKIE: Award,
  SUPPORTER: Star,
  FANATIC: Flame,
  ULTRAS: Shield,
  LEGEND: Crown,
};

export function GradeBadge({ grade, showName = true, size = 'md' }: GradeBadgeProps) {
  const info = GRADE_INFO[grade];
  const Icon = GRADE_ICONS[grade];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span className={`grade-badge grade-${grade.toLowerCase()} ${sizeClasses[size]}`}>
      <Icon className={`${iconSizes[size]} mr-1`} />
      {showName && info.name}
    </span>
  );
}
