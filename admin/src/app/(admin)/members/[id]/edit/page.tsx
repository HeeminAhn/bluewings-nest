'use client'

import { useParams, useRouter } from 'next/navigation'
import { useMember, useUpdateMember } from '@/hooks/use-members'
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
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'

interface FormData {
  nickname: string
  role: string
  isActive: boolean
}

export default function MemberEditPage() {
  const params = useParams()
  const router = useRouter()
  const memberId = Number(params.id)

  const { data: member, isLoading } = useMember(memberId)
  const updateMember = useUpdateMember()

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>()
  const isActive = watch('isActive')
  const role = watch('role')

  useEffect(() => {
    if (member) {
      reset({
        nickname: member.nickname,
        role: member.role,
        isActive: member.isActive,
      })
    }
  }, [member, reset])

  const onSubmit = async (data: FormData) => {
    try {
      await updateMember.mutateAsync({ id: memberId, data })
      toast.success('회원 정보가 수정되었습니다.')
      router.push(`/members/${memberId}`)
    } catch {
      toast.error('수정 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return <MemberEditSkeleton />
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">회원 정보를 불러올 수 없습니다.</p>
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
          <h1 className="text-2xl font-bold">회원 수정</h1>
          <p className="text-muted-foreground">{member.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>회원 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input id="id" value={member.id} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" value={member.email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input id="nickname" {...register('nickname')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">역할</Label>
              <Select value={role} onValueChange={(value) => setValue('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">일반 회원</SelectItem>
                  <SelectItem value="ADMIN">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">활성 상태</Label>
                <p className="text-sm text-muted-foreground">
                  비활성화하면 로그인할 수 없습니다.
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button type="submit" disabled={updateMember.isPending}>
                {updateMember.isPending && (
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

function MemberEditSkeleton() {
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
