'use client'

import { useRouter } from 'next/navigation'
import { useCreateNotice } from '@/hooks/use-notices'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

interface FormData {
  title: string
  content: string
  isPinned: boolean
}

export default function NewNoticePage() {
  const router = useRouter()
  const createNotice = useCreateNotice()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: '',
      content: '',
      isPinned: false,
    },
  })

  const isPinned = watch('isPinned')

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createNotice.mutateAsync(data)
      toast.success('공지사항이 등록되었습니다.')
      router.push(`/notices/${result.id}`)
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
          <h1 className="text-2xl font-bold">새 공지사항</h1>
          <p className="text-muted-foreground">새로운 공지사항을 작성합니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>공지사항 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <Button type="submit" disabled={createNotice.isPending}>
                {createNotice.isPending && (
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
