import { Calendar, MapPin, Clock } from 'lucide-react';
import type { Match } from '../../types';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export function MatchCard({ match, compact = false }: MatchCardProps) {
  const isFinished = match.status === 'FINISHED';
  const isScheduled = match.status === 'SCHEDULED';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  const getResultStyle = () => {
    if (!match.result) return '';
    switch (match.result) {
      case 'WIN':
        return 'bg-green-50 border-green-200';
      case 'LOSE':
        return 'bg-red-50 border-red-200';
      case 'DRAW':
        return 'bg-gray-50 border-gray-200';
      default:
        return '';
    }
  };

  const getResultBadge = () => {
    if (!match.result) return null;
    const styles = {
      WIN: 'bg-green-500 text-white',
      LOSE: 'bg-red-500 text-white',
      DRAW: 'bg-gray-500 text-white',
    };
    const labels = { WIN: '승', LOSE: '패', DRAW: '무' };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-bold ${styles[match.result]}`}>
        {labels[match.result]}
      </span>
    );
  };

  if (compact) {
    return (
      <div className={`p-3 rounded-xl border ${isFinished ? getResultStyle() : 'bg-white'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(match.matchDate)}</span>
            {match.matchTime && (
              <>
                <Clock className="w-4 h-4 ml-1" />
                <span>{formatTime(match.matchTime)}</span>
              </>
            )}
          </div>
          {getResultBadge()}
        </div>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className={`font-medium ${match.isHomeGame ? 'text-bluewings' : 'text-gray-700'}`}>
            {match.homeTeam}
          </span>
          {isFinished ? (
            <span className="font-bold text-lg">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-gray-400">vs</span>
          )}
          <span className={`font-medium ${!match.isHomeGame ? 'text-bluewings' : 'text-gray-700'}`}>
            {match.awayTeam}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`toss-card ${isFinished ? getResultStyle() : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-bluewings/10 text-bluewings rounded-full font-medium">
            {match.competition}
          </span>
          {match.matchDay && (
            <span className="text-xs text-gray-500">
              {match.matchDay}R
            </span>
          )}
        </div>
        {getResultBadge()}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-center">
          <p className={`font-bold text-lg ${match.isHomeGame ? 'text-bluewings' : 'text-gray-800'}`}>
            {match.homeTeam}
          </p>
          {match.isHomeGame && (
            <span className="text-xs text-bluewings">HOME</span>
          )}
        </div>

        <div className="px-4">
          {isFinished ? (
            <div className="text-center">
              <p className="text-2xl font-bold">
                {match.homeScore} - {match.awayScore}
              </p>
              <p className="text-xs text-gray-500">종료</p>
            </div>
          ) : isScheduled ? (
            <div className="text-center">
              <p className="text-xl font-medium text-gray-400">VS</p>
              <p className="text-sm font-medium text-bluewings">
                {formatTime(match.matchTime)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{match.status}</p>
          )}
        </div>

        <div className="flex-1 text-center">
          <p className={`font-bold text-lg ${!match.isHomeGame ? 'text-bluewings' : 'text-gray-800'}`}>
            {match.awayTeam}
          </p>
          {!match.isHomeGame && (
            <span className="text-xs text-bluewings">AWAY</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm text-gray-500 pt-3 border-t">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(match.matchDate)}</span>
        </div>
        {match.stadium && (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{match.stadium}</span>
          </div>
        )}
      </div>
    </div>
  );
}
