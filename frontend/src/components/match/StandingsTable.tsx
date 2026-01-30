import type { LeagueStanding } from '../../types';

interface StandingsTableProps {
  standings: LeagueStanding[];
  compact?: boolean;
}

export function StandingsTable({ standings, compact = false }: StandingsTableProps) {
  if (compact) {
    // 컴팩트 모드: 수원 순위 주변만 표시
    const suwonIndex = standings.findIndex((s) => s.isSuwon);
    const startIndex = Math.max(0, suwonIndex - 2);
    const endIndex = Math.min(standings.length, suwonIndex + 3);
    const visibleStandings = standings.slice(startIndex, endIndex);

    return (
      <div className="toss-card">
        <h3 className="font-semibold text-gray-900 mb-3">리그 순위</h3>
        <div className="space-y-2">
          {startIndex > 0 && (
            <div className="text-center text-gray-400 text-sm">...</div>
          )}
          {visibleStandings.map((team) => (
            <div
              key={team.teamName}
              className={`flex items-center justify-between p-2 rounded-lg ${
                team.isSuwon ? 'bg-bluewings/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-bold ${
                  team.position <= 3 ? 'text-bluewings' : 'text-gray-500'
                }`}>
                  {team.position}
                </span>
                <span className={`font-medium ${team.isSuwon ? 'text-bluewings' : 'text-gray-800'}`}>
                  {team.teamName}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">{team.played}경기</span>
                <span className="font-bold text-gray-900">{team.points}점</span>
              </div>
            </div>
          ))}
          {endIndex < standings.length && (
            <div className="text-center text-gray-400 text-sm">...</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="toss-card overflow-x-auto">
      <h3 className="font-semibold text-gray-900 mb-4">K리그1 순위표</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-gray-500 whitespace-nowrap">
            <th className="text-left py-2 px-1">순위</th>
            <th className="text-left py-2 px-1">팀</th>
            <th className="text-center py-2 px-1">경기</th>
            <th className="text-center py-2 px-1">승</th>
            <th className="text-center py-2 px-1">무</th>
            <th className="text-center py-2 px-1">패</th>
            <th className="text-center py-2 px-1">득실</th>
            <th className="text-center py-2 px-1 font-bold">승점</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr
              key={team.teamName}
              className={`border-b last:border-0 whitespace-nowrap ${
                team.isSuwon ? 'bg-bluewings/10 font-medium' : ''
              }`}
            >
              <td className={`py-2 px-1 ${
                team.position <= 3 ? 'text-bluewings font-bold' :
                team.position >= standings.length - 1 ? 'text-red-500' : ''
              }`}>
                {team.position}
              </td>
              <td className={`py-2 px-1 ${team.isSuwon ? 'text-bluewings font-bold' : ''}`}>
                {team.teamName}
              </td>
              <td className="text-center py-2 px-1">{team.played}</td>
              <td className="text-center py-2 px-1 text-green-600">{team.won}</td>
              <td className="text-center py-2 px-1 text-gray-500">{team.drawn}</td>
              <td className="text-center py-2 px-1 text-red-500">{team.lost}</td>
              <td className={`text-center py-2 px-1 ${
                team.goalDifference > 0 ? 'text-green-600' :
                team.goalDifference < 0 ? 'text-red-500' : ''
              }`}>
                {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
              </td>
              <td className="text-center py-2 px-1 font-bold">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
