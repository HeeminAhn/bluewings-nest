'use client'

import { useParams, useRouter } from 'next/navigation'
import { useReport, useUpdateReport } from '@/hooks/use-reports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import type { ReportStatus } from '@/types'

const statusLabels: Record<ReportStatus, string> = {
  PENDING: '처리 대기',
  ACCEPTED: '신고 승인',
  REJECTED: '신고 반려',
  RESOLVED: '처리 완료',
}

const statusColors: Record<ReportStatus, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  PENDING: 'outline',
  ACCEPTED: 'destructive',
  REJECTED: 'secondary',
  RESOLVED: 'default',
}

const reasonLabels: Record<string, string> = {
  SPAM: '스팸/도배',
  HARASSMENT: '욕설/비방',
  INAPPROPRIATE: '부적절한 콘텐츠',
  ADVERTISING: '광고/홍보',
  IMPERSONATION: '사칭',
  OTHER: '기타',
}

interface FormData {
  status: string
  adminNote: string
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = Number(params.id)

  const { data: report, isLoading, error } = useReport(reportId)
  const updateReport = useUpdateReport()

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>()
  const status = watch('status')

  useEffect(() => {
    if (report) {
      reset({
        status: report.status,
        adminNote: report.adminNote || '',
      })
    }
  }, [report, reset])

  const onSubmit = async (data: FormData) => {
    try {
      await updateReport.mutateAsync({ id: reportId, data })
      toast.success('신고 처리가 완료되었습니다.')
    } catch {
      toast.error('처리 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return <ReportDetailSkeleton />
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">신고 정보를 불러올 수 없습니다.</p>
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
          <h1 className="text-2xl font-bold">신고 상세</h1>
          <p className="text-muted-foreground">신고 ID: {report.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>신고 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow label="신고 ID" value={String(report.id)} />
          <InfoRow label="신고자" value={report.reporterNickname} />
          <InfoRow label="피신고자" value={report.reportedMemberNickname} />
          <InfoRow
            label="신고 사유"
            value={reasonLabels[report.reason] || report.reason}
          />
          <InfoRow label="상세 설명" value={report.description || '-'} />
          <InfoRow label="콘텐츠 유형" value={report.contentType || '-'} />
          <InfoRow label="콘텐츠 ID" value={report.contentId ? String(report.contentId) : '-'} />
          <InfoRow
            label="현재 상태"
            value={
              <Badge variant={statusColors[report.status]}>
                {statusLabels[report.status]}
              </Badge>
            }
          />
          <InfoRow label="신고일시" value={formatDateTime(report.createdAt)} />
          <InfoRow label="처리자" value={report.processedByNickname || '-'} />
          <InfoRow
            label="처리일시"
            value={report.processedAt ? formatDateTime(report.processedAt) : '-'}
          />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>신고 처리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="status">처리 상태</Label>
              <Select value={status} onValueChange={(v) => setValue('status', v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">처리 대기</SelectItem>
                  <SelectItem value="ACCEPTED">신고 승인</SelectItem>
                  <SelectItem value="REJECTED">신고 반려</SelectItem>
                  <SelectItem value="RESOLVED">처리 완료</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNote">관리자 메모</Label>
              <Textarea
                id="adminNote"
                placeholder="처리 내용을 기록하세요..."
                rows={3}
                {...register('adminNote')}
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" disabled={updateReport.isPending}>
                {updateReport.isPending && (
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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex border-b pb-3 last:border-0 last:pb-0">
      <span className="w-32 text-sm text-muted-foreground">{label}</span>
      <span className="flex-1 text-sm">{value}</span>
    </div>
  )
}

function ReportDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
