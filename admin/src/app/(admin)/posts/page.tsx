'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { usePosts, useDeletePost } from '@/hooks/use-posts'
import { useCategories } from '@/hooks/use-categories'
import { DataTable, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils'
import type { Post } from '@/types'
import { Trash2, Search, X } from 'lucide-react'
import { toast } from 'sonner'

export default function PostsPage() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [authorNickname, setAuthorNickname] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: categoriesData } = useCategories({ size: 100 })

  const { data, isLoading } = usePosts({
    page,
    size,
    keyword: keyword || undefined,
    authorNickname: authorNickname || undefined,
    categoryId: categoryId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const clearFilters = () => {
    setKeyword('')
    setAuthorNickname('')
    setCategoryId('')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }

  const hasFilters = keyword || authorNickname || categoryId || startDate || endDate

  const deletePost = useDeletePost()

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deletePost.mutateAsync(deleteId)
      toast.success('게시글이 삭제되었습니다.')
      setDeleteId(null)
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: 'title',
      header: '제목',
      cell: ({ row }) => (
        <span className="font-medium max-w-[300px] truncate block">
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: 'authorNickname',
      header: '작성자',
    },
    {
      accessorKey: 'categoryName',
      header: '카테고리',
      cell: ({ row }) => row.original.categoryName ? (
        <Badge variant="outline">{row.original.categoryName}</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      accessorKey: 'viewCount',
      header: '조회수',
      cell: ({ row }) => row.original.viewCount.toLocaleString(),
    },
    {
      accessorKey: 'likeCount',
      header: '좋아요',
      cell: ({ row }) => row.original.likeCount.toLocaleString(),
    },
    {
      accessorKey: 'commentCount',
      header: '댓글',
      cell: ({ row }) => row.original.commentCount.toLocaleString(),
    },
    {
      accessorKey: 'createdAt',
      header: '작성일',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteId(row.original.id)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const handleRowClick = (post: Post) => {
    router.push(`/posts/${post.id}`)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">게시글 관리</h1>
        <p className="text-muted-foreground">커뮤니티 게시글을 관리합니다.</p>
      </div>

      {/* 필터 영역 */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 제목/내용 검색 */}
          <div className="space-y-2">
            <Label htmlFor="keyword">제목/내용</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="keyword"
                placeholder="검색..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setPage(0)
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* 작성자 */}
          <div className="space-y-2">
            <Label htmlFor="author">작성자</Label>
            <Input
              id="author"
              placeholder="닉네임 검색..."
              value={authorNickname}
              onChange={(e) => {
                setAuthorNickname(e.target.value)
                setPage(0)
              }}
            />
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select value={categoryId} onValueChange={(value) => {
              setCategoryId(value === 'all' ? '' : value)
              setPage(0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {categoriesData?.content.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 작성일 시작 */}
          <div className="space-y-2">
            <Label htmlFor="startDate">작성일 (시작)</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPage(0)
              }}
            />
          </div>

          {/* 작성일 끝 */}
          <div className="space-y-2">
            <Label htmlFor="endDate">작성일 (끝)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPage(0)
              }}
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              필터 초기화
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.content || []}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />

      {data && (
        <DataTablePagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={size}
          onPageChange={setPage}
          onSizeChange={(newSize) => {
            setSize(newSize)
            setPage(0)
          }}
        />
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="게시글 삭제"
        description="이 게시글을 삭제하시겠습니까? 관련된 댓글도 함께 삭제됩니다."
        onConfirm={handleDelete}
        isLoading={deletePost.isPending}
      />
    </div>
  )
}
