'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCategory, useDeleteCategory } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = Number(params.id)

  const { data: category, isLoading, error } = useCategory(categoryId)
  const deleteCategory = useDeleteCategory()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteCategory.mutateAsync(categoryId)
      toast.success('카테고리가 삭제되었습니다.')
      router.push('/categories')
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return <CategoryDetailSkeleton />
  }

  if (error || !category) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{category.name}</h1>
              {category.isActive ? (
                <Badge variant="default">활성</Badge>
              ) : (
                <Badge variant="secondary">비활성</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              순서: {category.displayOrder} · {formatDateTime(category.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/categories/${categoryId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      {category.description && (
        <Card>
          <CardHeader>
            <CardTitle>설명</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{category.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>상세 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow label="카테고리 ID" value={String(category.id)} />
          <InfoRow label="카테고리명" value={category.name} />
          <InfoRow label="정렬 순서" value={String(category.displayOrder)} />
          <InfoRow label="상태" value={category.isActive ? '활성' : '비활성'} />
          <InfoRow label="생성일" value={formatDateTime(category.createdAt)} />
          <InfoRow label="수정일" value={formatDateTime(category.updatedAt)} />
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="카테고리 삭제"
        description="이 카테고리를 삭제하시겠습니까? 해당 카테고리가 적용된 게시글은 카테고리가 없는 상태가 됩니다."
        onConfirm={handleDelete}
        isLoading={deleteCategory.isPending}
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b pb-3 last:border-0 last:pb-0">
      <span className="w-32 text-sm text-muted-foreground">{label}</span>
      <span className="flex-1 text-sm">{value}</span>
    </div>
  )
}

function CategoryDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
