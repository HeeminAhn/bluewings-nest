import { FileText, MessageCircle, Heart, Calendar } from 'lucide-react';
import type { ActivityStats } from '../../types';

interface ActivityCardProps {
  stats: ActivityStats;
}

export function ActivityCard({ stats }: ActivityCardProps) {
  const activities = [
    { icon: FileText, label: '게시글', value: stats.postCount, points: 10 },
    { icon: MessageCircle, label: '댓글', value: stats.commentCount, points: 3 },
    { icon: Heart, label: '좋아요', value: stats.likeCount, points: 1 },
    { icon: Calendar, label: '출석', value: stats.attendanceCount, points: 5 },
  ];

  return (
    <div className="toss-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">활동 내역</h3>

      <div className="grid grid-cols-2 gap-3">
        {activities.map(({ icon: Icon, label, value, points }) => (
          <div
            key={label}
            className="bg-gray-50 rounded-xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Icon className="w-5 h-5 text-bluewings" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-lg font-bold text-gray-900">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-400">+{points}점/건</p>
            </div>
          </div>
        ))}
      </div>

      {stats.lastAttendanceDate && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          최근 출석: {new Date(stats.lastAttendanceDate).toLocaleDateString('ko-KR')}
        </p>
      )}
    </div>
  );
}
