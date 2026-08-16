import type { LeagueStanding } from '../../types';

interface StandingsTableProps {
  standings: LeagueStanding[];
  compact?: boolean;
}

export function StandingsTable({ standings, compact = false }: StandingsTableProps) {
  if (compact) {
    const suwonIndex = standings.findIndex((s) => s.isSuwon);
    const startIndex = Math.max(0, suwonIndex - 2);
    const endIndex = Math.min(standings.length, suwonIndex + 3);
    const visibleStandings = standings.slice(startIndex, endIndex);

    return (
      <div className="bg-white rounded-lg border border-[#c2c6d3] p-4">
        <h3 className="font-bold text-[#1c1b1b] mb-3">리그 순위</h3>
        <div className="space-y-2">
          {startIndex > 0 && <div className="text-center text-[#737782] text-sm">...</div>}
          {visibleStandings.map((team) => (
            <div
              key={team.teamName}
              className={`flex items-center justify-between p-2 rounded-lg ${
                team.isSuwon ? 'bg-[#d6e3ff]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-bold ${
                  team.position <= 3 ? 'text-[#004C97]' : 'text-[#737782]'
                }`}>
                  {team.position}
                </span>
                <span className={`font-semibold ${team.isSuwon ? 'text-[#004C97]' : 'text-[#1c1b1b]'}`}>
                  {team.teamName}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-[#737782]">{team.played}경기</span>
                <span className="font-bold text-[#1c1b1b]">{team.points}점</span>
              </div>
            </div>
          ))}
          {endIndex < standings.length && <div className="text-center text-[#737782] text-sm">...</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#c2c6d3] overflow-x-auto">
      <div className="p-4 border-b border-[#c2c6d3]">
        <h3 className="font-bold text-[#1c1b1b]">K리그 순위표</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#00366e] text-white whitespace-nowrap">
            <th className="text-left py-3 px-3 font-semibold text-xs uppercase tracking-wider">#</th>
            <th className="text-left py-3 px-3 font-semibold text-xs uppercase tracking-wider">Club</th>
            <th className="text-center py-3 px-2 font-semibold text-xs uppercase tracking-wider">P</th>
            <th className="text-center py-3 px-2 font-semibold text-xs uppercase tracking-wider">W</th>
            <th className="text-center py-3 px-2 font-semibold text-xs uppercase tracking-wider">D</th>
            <th className="text-center py-3 px-2 font-semibold text-xs uppercase tracking-wider">L</th>
            <th className="text-center py-3 px-2 font-semibold text-xs uppercase tracking-wider">GD</th>
            <th className="text-center py-3 px-3 font-semibold text-xs uppercase tracking-wider">PTS</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr
              key={team.teamName}
              className={`border-b border-[#f0eded] last:border-0 whitespace-nowrap ${
                team.isSuwon ? 'bg-[#d6e3ff] font-semibold' : 'hover:bg-[#f6f3f2]'
              }`}
            >
              <td className={`py-3 px-3 font-bold ${
                team.position <= 3 ? 'text-[#004C97]' :
                team.position >= standings.length - 1 ? 'text-[#ba1a1a]' : 'text-[#737782]'
              }`}>
                {team.position}
              </td>
              <td className={`py-3 px-3 ${team.isSuwon ? 'text-[#004C97] font-bold uppercase' : 'text-[#1c1b1b]'}`}>
                {team.teamName}
              </td>
              <td className="text-center py-3 px-2 text-[#424751]">{team.played}</td>
              <td className="text-center py-3 px-2 text-[#424751]">{team.won}</td>
              <td className="text-center py-3 px-2 text-[#424751]">{team.drawn}</td>
              <td className="text-center py-3 px-2 text-[#424751]">{team.lost}</td>
              <td className={`text-center py-3 px-2 font-semibold ${
                team.goalDifference > 0 ? 'text-[#004C97]' :
                team.goalDifference < 0 ? 'text-[#ba1a1a]' : 'text-[#737782]'
              }`}>
                {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
              </td>
              <td className="text-center py-3 px-3 font-bold text-[#1c1b1b]">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
