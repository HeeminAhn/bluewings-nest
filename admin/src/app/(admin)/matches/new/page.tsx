'use client'

import { useRouter } from 'next/navigation'
import { useCreateMatch } from '@/hooks/use-matches'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  stadium: string
  competition: string
  season: string
  matchDay: number | null
  status: string
}

export default function NewMatchPage() {
  const router = useRouter()
  const createMatch = useCreateMatch()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      homeTeam: '수원 삼성',
      stadium: '수원월드컵경기장',
      competition: 'K리그2',
      season: '2025',
      status: 'SCHEDULED',
    },
  })

  const competition = watch('competition')
  const status = watch('status')

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createMatch.mutateAsync({ ...data })
      toast.success('경기가 등록되었습니다.')
      router.push(`/matches/${result.id}`)
    } catch {
      toast.error('등록 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">새 경기</h1>
          <p className="text-muted-foreground">새로운 경기를 등록합니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>경기 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                {errors.homeTeam && (
                  <p className="text-sm text-destructive">{errors.homeTeam.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="awayTeam">원정팀 *</Label>
                <Input
                  id="awayTeam"
                  {...register('awayTeam', { required: '원정팀을 입력하세요' })}
                />
                {errors.awayTeam && (
                  <p className="text-sm text-destructive">{errors.awayTeam.message}</p>
                )}
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
                {errors.season && (
                  <p className="text-sm text-destructive">{errors.season.message}</p>
                )}
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
              <Button type="submit" disabled={createMatch.isPending}>
                {createMatch.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                등록
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
