'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useNotice, useDeleteNotice } from '@/hooks/use-notices'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, Trash2, Pencil, Pin, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function NoticeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const noticeId = Number(params.id)

  const { data: notice, isLoading, error } = useNotice(noticeId)
  const deleteNotice = useDeleteNotice()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteNotice.mutateAsync(noticeId)
      toast.success('공지사항이 삭제되었습니다.')
      router.push('/notices')
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return <NoticeDetailSkeleton />
  }

  if (error || !notice) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{notice.title}</h1>
              {notice.isPinned && (
                <Badge variant="default" className="gap-1">
                  <Pin className="h-3 w-3" />
                  고정
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {notice.authorNickname} · {formatDateTime(notice.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/notices/${noticeId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      <Badge variant="outline" className="gap-1">
        <Eye className="h-3 w-3" />
        {notice.viewCount.toLocaleString()}
      </Badge>

      <Card>
        <CardHeader>
          <CardTitle>내용</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: notice.content }}
          />
        </CardContent>
      </Card>

      {notice.images && notice.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>첨부 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {notice.images.map((image, index) => (
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
          <InfoRow label="공지사항 ID" value={String(notice.id)} />
          <InfoRow label="작성자" value={notice.authorNickname} />
          <InfoRow label="작성일" value={formatDateTime(notice.createdAt)} />
          <InfoRow label="수정일" value={formatDateTime(notice.updatedAt)} />
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="공지사항 삭제"
        description="이 공지사항을 삭제하시겠습니까?"
        onConfirm={handleDelete}
        isLoading={deleteNotice.isPending}
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

function NoticeDetailSkeleton() {
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
