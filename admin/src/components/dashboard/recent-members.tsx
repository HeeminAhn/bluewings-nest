import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Member {
  id: number
  nickname: string
  email: string
  createdAt: string
}

interface RecentMembersProps {
  members: Member[]
}

export function RecentMembers({ members }: RecentMembersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Users className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">최근 가입 회원</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">최근 가입 회원이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {members.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/members/${member.id}`}
                  className="block hover:bg-accent rounded-lg p-2 -mx-2 transition-colors"
                >
                  <p className="font-medium text-sm">{member.nickname}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.email} · {formatDateTime(member.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
