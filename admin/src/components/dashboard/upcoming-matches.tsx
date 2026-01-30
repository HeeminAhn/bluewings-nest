import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  matchDate: string
  competition: string
}

interface UpcomingMatchesProps {
  matches: Match[]
}

export function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Calendar className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">다가오는 경기</CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">예정된 경기가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {matches.map((match) => (
              <li key={match.id}>
                <Link
                  href={`/matches/${match.id}`}
                  className="flex items-center justify-between hover:bg-accent rounded-lg p-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {match.homeTeam} vs {match.awayTeam}
                    </span>
                    <Badge variant="outline">{match.competition}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(match.matchDate, { weekday: 'short' })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
