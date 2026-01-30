'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { usePost, useDeletePost, useUpdatePostCategory } from '@/hooks/use-posts'
import { useCategories } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, Trash2, Eye, Heart, MessageSquare, FolderEdit } from 'lucide-react'
import { toast } from 'sonner'
import { CATEGORY_COLORS } from '@/types'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = Number(params.id)

  const { data: post, isLoading, error } = usePost(postId)
  const { data: categoriesData } = useCategories({ size: 100 })
  const deletePost = useDeletePost()
  const updateCategory = useUpdatePostCategory()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const categories = categoriesData?.content || []

  const handleCategoryChange = async (value: string) => {
    const categoryId = value === 'none' ? null : Number(value)
    try {
      await updateCategory.mutateAsync({ postId, categoryId })
      toast.success('카테고리가 변경되었습니다.')
    } catch {
      toast.error('카테고리 변경 중 오류가 발생했습니다.')
    }
  }

  const getCategoryColor = (color: string) => {
    return CATEGORY_COLORS.find(c => c.value === color)?.class || 'bg-gray-100 text-gray-700'
  }

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(postId)
      toast.success('게시글이 삭제되었습니다.')
      router.push('/posts')
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return <PostDetailSkeleton />
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">게시글을 불러올 수 없습니다.</p>
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
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <p className="text-muted-foreground">
              {post.authorNickname} · {formatDateTime(post.createdAt)}
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          삭제
        </Button>
      </div>

      <div className="flex gap-4">
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          {post.viewCount.toLocaleString()}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Heart className="h-3 w-3" />
          {post.likeCount.toLocaleString()}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <MessageSquare className="h-3 w-3" />
          {post.commentCount.toLocaleString()}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderEdit className="h-5 w-5" />
            카테고리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={post.categoryId?.toString() || 'none'}
              onValueChange={handleCategoryChange}
              disabled={updateCategory.isPending}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">카테고리 없음</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(category.color)}`}>
                      {category.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updateCategory.isPending && (
              <span className="text-sm text-muted-foreground">변경 중...</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>내용</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
      </Card>

      {post.images && post.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>첨부 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {post.images.map((image, index) => (
                <Image
                  key={index}
                  src={`/uploads${image.filePath}`}
                  alt={image.originalName}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-lg"
                  unoptimized
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>상세 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow label="게시글 ID" value={String(post.id)} />
          <InfoRow label="작성자" value={post.authorNickname} />
          <InfoRow label="작성자 ID" value={String(post.authorId)} />
          <InfoRow label="작성일" value={formatDateTime(post.createdAt)} />
          <InfoRow label="수정일" value={formatDateTime(post.updatedAt)} />
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="게시글 삭제"
        description="이 게시글을 삭제하시겠습니까? 관련된 댓글도 함께 삭제됩니다."
        onConfirm={handleDelete}
        isLoading={deletePost.isPending}
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

function PostDetailSkeleton() {
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
