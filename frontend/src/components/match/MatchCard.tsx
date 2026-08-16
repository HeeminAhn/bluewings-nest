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

  const getResultBadge = () => {
    if (!match.result) return null;
    const styles = {
      WIN: 'bg-[#004C97] text-white',
      LOSE: 'bg-[#ba1a1a] text-white',
      DRAW: 'bg-[#424751] text-white',
    };
    const labels = { WIN: '승', LOSE: '패', DRAW: '무' };
    return (
      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${styles[match.result]}`}>
        {labels[match.result]}
      </span>
    );
  };

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${
        isFinished
          ? match.result === 'WIN' ? 'border-[#004C97]/30 bg-[#d6e3ff]/30'
          : match.result === 'LOSE' ? 'border-[#ba1a1a]/30 bg-red-50'
          : 'border-[#c2c6d3] bg-[#f0eded]'
          : 'border-[#c2c6d3] bg-white'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#737782]">
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
          <span className={`font-semibold ${match.isHomeGame ? 'text-[#004C97]' : 'text-[#1c1b1b]'}`}>
            {match.homeTeam}
          </span>
          {isFinished ? (
            <span className="font-extrabold text-lg text-[#1c1b1b]">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-[#737782] font-bold">vs</span>
          )}
          <span className={`font-semibold ${!match.isHomeGame ? 'text-[#004C97]' : 'text-[#1c1b1b]'}`}>
            {match.awayTeam}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border p-5 ${
      isFinished
        ? match.result === 'WIN' ? 'border-[#004C97]/30'
        : match.result === 'LOSE' ? 'border-[#ba1a1a]/30'
        : 'border-[#c2c6d3]'
        : 'border-[#c2c6d3]'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-[#004C97] text-white rounded font-semibold uppercase tracking-wider">
            {match.competition}
          </span>
          {match.matchDay && (
            <span className="text-xs text-[#737782] font-semibold">
              R{match.matchDay}
            </span>
          )}
        </div>
        {getResultBadge()}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-center">
          <p className={`font-bold text-lg ${match.isHomeGame ? 'text-[#004C97]' : 'text-[#1c1b1b]'}`}>
            {match.homeTeam}
          </p>
          {match.isHomeGame && (
            <span className="text-xs text-[#004C97] font-semibold uppercase tracking-wider">HOME</span>
          )}
        </div>

        <div className="px-4">
          {isFinished ? (
            <div className="text-center">
              <p className="text-3xl font-extrabold text-[#1c1b1b]">
                {match.homeScore} - {match.awayScore}
              </p>
              <p className="text-xs text-[#737782] font-semibold uppercase tracking-wider mt-1">Full Time</p>
            </div>
          ) : isScheduled ? (
            <div className="text-center">
              <p className="text-2xl font-extrabold text-[#c2c6d3]">VS</p>
              <p className="text-sm font-bold text-[#004C97]">
                {formatTime(match.matchTime)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#737782] font-semibold uppercase">{match.status}</p>
          )}
        </div>

        <div className="flex-1 text-center">
          <p className={`font-bold text-lg ${!match.isHomeGame ? 'text-[#004C97]' : 'text-[#1c1b1b]'}`}>
            {match.awayTeam}
          </p>
          {!match.isHomeGame && (
            <span className="text-xs text-[#004C97] font-semibold uppercase tracking-wider">AWAY</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm text-[#737782] pt-3 border-t border-[#f0eded]">
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
