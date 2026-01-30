import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Post {
  id: number
  title: string
  authorNickname: string
  createdAt: string
}

interface RecentPostsProps {
  posts: Post[]
}

export function RecentPosts({ posts }: RecentPostsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <FileText className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">최근 게시글</CardTitle>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">최근 게시글이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="block hover:bg-accent rounded-lg p-2 -mx-2 transition-colors"
                >
                  <p className="font-medium text-sm truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.authorNickname} · {formatDateTime(post.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
