'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useNotice, useUpdateNotice } from '@/hooks/use-notices'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

interface FormData {
  title: string
  content: string
  isPinned: boolean
}

export default function EditNoticePage() {
  const params = useParams()
  const router = useRouter()
  const noticeId = Number(params.id)

  const { data: notice, isLoading } = useNotice(noticeId)
  const updateNotice = useUpdateNotice()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>()
  const isPinned = watch('isPinned')

  useEffect(() => {
    if (notice) {
      reset({
        title: notice.title,
        content: notice.content,
        isPinned: notice.isPinned,
      })
    }
  }, [notice, reset])

  const onSubmit = async (data: FormData) => {
    try {
      await updateNotice.mutateAsync({ id: noticeId, data })
      toast.success('공지사항이 수정되었습니다.')
      router.push(`/notices/${noticeId}`)
    } catch {
      toast.error('수정 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return <NoticeEditSkeleton />
  }

  if (!notice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">공지사항을 불러올 수 없습니다.</p>
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
          <h1 className="text-2xl font-bold">공지사항 수정</h1>
          <p className="text-muted-foreground">공지사항을 수정합니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>공지사항 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input id="id" value={notice.id} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                placeholder="공지사항 제목을 입력하세요"
                {...register('title', { required: '제목을 입력하세요' })}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용 *</Label>
              <Textarea
                id="content"
                placeholder="공지사항 내용을 입력하세요"
                rows={10}
                {...register('content', { required: '내용을 입력하세요' })}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPinned">상단 고정</Label>
                <p className="text-sm text-muted-foreground">
                  공지사항 목록 상단에 고정됩니다.
                </p>
              </div>
              <Switch
                id="isPinned"
                checked={isPinned}
                onCheckedChange={(checked) => setValue('isPinned', checked)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" disabled={updateNotice.isPending}>
                {updateNotice.isPending && (
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

function NoticeEditSkeleton() {
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
