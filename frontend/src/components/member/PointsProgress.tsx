import type { GradeInfoResponse } from '../../types';
import { GradeBadge } from './GradeBadge';
import { TrendingUp } from 'lucide-react';

interface PointsProgressProps {
  gradeInfo: GradeInfoResponse;
}

export function PointsProgress({ gradeInfo }: PointsProgressProps) {
  const { currentGrade, nextGrade, currentPoints, pointsToNextGrade } = gradeInfo;

  // 진행률 계산
  const progressPercent = nextGrade && pointsToNextGrade !== null
    ? Math.min(100, ((currentPoints - currentGrade.requiredPoints) / (nextGrade.requiredPoints - currentGrade.requiredPoints)) * 100)
    : 100;

  return (
    <div className="toss-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">나의 등급</h3>
        <GradeBadge grade={currentGrade.name} size="lg" />
      </div>

      <div className="flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-bluewings" />
        <span className="text-2xl font-bold text-gray-900">
          {currentPoints.toLocaleString()}
        </span>
        <span className="text-gray-500">포인트</span>
      </div>

      {nextGrade && pointsToNextGrade !== null && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              다음 등급: <span className="font-medium text-gray-700">{nextGrade.displayName}</span>
            </span>
            <span className="text-gray-500">
              {pointsToNextGrade.toLocaleString()}점 필요
            </span>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-bluewings-light to-bluewings rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-right text-sm text-bluewings font-medium">
            {progressPercent.toFixed(1)}%
          </div>
        </div>
      )}

      {!nextGrade && (
        <div className="text-center py-4">
          <span className="text-amber-500 font-semibold">최고 등급 달성!</span>
        </div>
      )}
    </div>
  );
}
