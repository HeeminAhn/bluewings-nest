'use client'

import { useRouter } from 'next/navigation'
import { useCreateCategory } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { CATEGORY_COLORS } from '@/types'

interface FormData {
  name: string
  description: string
  displayOrder: number
  color: string
}

export default function NewCategoryPage() {
  const router = useRouter()
  const createCategory = useCreateCategory()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      displayOrder: 0,
      color: 'gray',
    },
  })

  const selectedColor = watch('color')

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createCategory.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        displayOrder: data.displayOrder,
        color: data.color,
      })
      toast.success('카테고리가 등록되었습니다.')
      router.push(`/categories/${result.id}`)
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
          <h1 className="text-2xl font-bold">새 카테고리</h1>
          <p className="text-muted-foreground">새로운 카테고리를 생성합니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>카테고리 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">카테고리명 *</Label>
              <Input
                id="name"
                placeholder="카테고리명을 입력하세요"
                {...register('name', { required: '카테고리명을 입력하세요' })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="카테고리 설명을 입력하세요 (선택)"
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">정렬 순서</Label>
              <Input
                id="displayOrder"
                type="number"
                placeholder="0"
                {...register('displayOrder', { valueAsNumber: true })}
              />
              <p className="text-sm text-muted-foreground">
                숫자가 작을수록 앞에 표시됩니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label>뱃지 색상</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <label
                    key={color.value}
                    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-all ${color.class} ${
                      selectedColor === color.value
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="radio"
                      value={color.value}
                      {...register('color')}
                      className="sr-only"
                    />
                    {color.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" disabled={createCategory.isPending}>
                {createCategory.isPending && (
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
