'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMatch, useUpdateMatch } from '@/hooks/use-matches'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

interface FormData {
  matchDate: string
  matchTime: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  stadium: string
  competition: string
  season: string
  matchDay: number | null
  status: string
}

export default function EditMatchPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = Number(params.id)

  const { data: match, isLoading } = useMatch(matchId)
  const updateMatch = useUpdateMatch()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>()
  const competition = watch('competition')
  const status = watch('status')

  useEffect(() => {
    if (match) {
      reset({
        matchDate: match.matchDate?.split('T')[0] || '',
        matchTime: match.matchTime || '',
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore ?? null,
        awayScore: match.awayScore ?? null,
        stadium: match.stadium,
        competition: match.competition,
        season: match.season,
        matchDay: match.matchDay ?? null,
        status: match.status,
      })
    }
  }, [match, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const submitData = {
        ...data,
        homeScore: data.homeScore ?? undefined,
        awayScore: data.awayScore ?? undefined,
        matchDay: data.matchDay ?? undefined,
      }
      await updateMatch.mutateAsync({ id: matchId, data: submitData })
      toast.success('경기 정보가 수정되었습니다.')
      router.push(`/matches/${matchId}`)
    } catch {
      toast.error('수정 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return <MatchEditSkeleton />
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">경기 정보를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">경기 수정</h1>
          <p className="text-muted-foreground">경기 정보를 수정합니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>경기 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input id="id" value={match.id} disabled />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="matchDate">경기일 *</Label>
                <Input
                  id="matchDate"
                  type="date"
                  {...register('matchDate', { required: '경기일을 선택하세요' })}
                />
                {errors.matchDate && (
                  <p className="text-sm text-destructive">{errors.matchDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchTime">시간</Label>
                <Input
                  id="matchTime"
                  placeholder="예: 19:00"
                  {...register('matchTime')}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="homeTeam">홈팀 *</Label>
                <Input
                  id="homeTeam"
                  {...register('homeTeam', { required: '홈팀을 입력하세요' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awayTeam">원정팀 *</Label>
                <Input
                  id="awayTeam"
                  {...register('awayTeam', { required: '원정팀을 입력하세요' })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="homeScore">홈 득점</Label>
                <Input
                  id="homeScore"
                  type="number"
                  {...register('homeScore', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awayScore">원정 득점</Label>
                <Input
                  id="awayScore"
                  type="number"
                  {...register('awayScore', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stadium">경기장</Label>
              <Input id="stadium" {...register('stadium')} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="competition">대회 *</Label>
                <Select value={competition} onValueChange={(v) => setValue('competition', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="K리그1">K리그1</SelectItem>
                    <SelectItem value="K리그2">K리그2</SelectItem>
                    <SelectItem value="FA컵">FA컵</SelectItem>
                    <SelectItem value="ACL">ACL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="season">시즌 *</Label>
                <Input
                  id="season"
                  {...register('season', { required: '시즌을 입력하세요' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchDay">라운드</Label>
                <Input
                  id="matchDay"
                  type="number"
                  {...register('matchDay', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태 *</Label>
              <Select value={status} onValueChange={(v) => setValue('status', v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">예정</SelectItem>
                  <SelectItem value="LIVE">진행중</SelectItem>
                  <SelectItem value="FINISHED">종료</SelectItem>
                  <SelectItem value="POSTPONED">연기</SelectItem>
                  <SelectItem value="CANCELLED">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" disabled={updateMatch.isPending}>
                {updateMatch.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

function MatchEditSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
