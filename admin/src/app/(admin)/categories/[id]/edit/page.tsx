'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCategory, useUpdateCategory } from '@/hooks/use-categories'
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
import { CATEGORY_COLORS } from '@/types'

interface FormData {
  name: string
  description: string
  displayOrder: number
  isActive: boolean
  color: string
}

export default function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = Number(params.id)

  const { data: category, isLoading } = useCategory(categoryId)
  const updateCategory = useUpdateCategory()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>()
  const isActive = watch('isActive')
  const selectedColor = watch('color')

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        displayOrder: category.displayOrder,
        isActive: category.isActive,
        color: category.color,
      })
    }
  }, [category, reset])

  const onSubmit = async (data: FormData) => {
    try {
      await updateCategory.mutateAsync({
        id: categoryId,
        data: {
          name: data.name,
          description: data.description || undefined,
          displayOrder: data.displayOrder,
          isActive: data.isActive,
          color: data.color,
        },
      })
      toast.success('카테고리가 수정되었습니다.')
      router.push(`/categories/${categoryId}`)
    } catch {
      toast.error('수정 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return <CategoryEditSkeleton />
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">카테고리를 불러올 수 없습니다.</p>
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
          <h1 className="text-2xl font-bold">카테고리 수정</h1>
          <p className="text-muted-foreground">카테고리 정보를 수정합니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>카테고리 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input id="id" value={category.id} disabled />
            </div>

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

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">활성 상태</Label>
                <p className="text-sm text-muted-foreground">
                  비활성화하면 프론트엔드에서 표시되지 않습니다.
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" disabled={updateCategory.isPending}>
                {updateCategory.isPending && (
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

function CategoryEditSkeleton() {
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
