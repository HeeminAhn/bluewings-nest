'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Eye,
  MoreVertical,
  Edit2,
  Trash2,
  Send,
  X,
  Camera,
  Loader2,
  Flag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Header } from '@/components/layout';
import { GradeBadge } from '@/components/member/GradeBadge';
import { CommentItem } from '@/components/community';
import { Toast, ReportModal } from '@/components/common';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Post, Comment, UploadImageResponse } from '@/lib/types';

interface PostDetailClientProps {
  initialPost: Post;
  postId: number;
}

export default function PostDetailClient({ initialPost, postId }: PostDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated, member, _hasHydrated } = useAuthStore();

  const [post, setPost] = useState<Post>(initialPost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentImages, setCommentImages] = useState<UploadImageResponse[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const commentImageInputRef = useRef<HTMLInputElement>(null);

  const isAuthor = _hasHydrated && member?.id === post.author.id;
  const showAuthUI = _hasHydrated && isAuthenticated;

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      fetchComments();
    }
  }, [postId, _hasHydrated, isAuthenticated]);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      refreshPost();
    }
  }, [_hasHydrated, isAuthenticated]);

  const refreshPost = async () => {
    const response = await api.getPost(postId, true);
    if (response.success && response.data) {
      setPost(response.data);
    }
  };

  const fetchComments = async () => {
    const response = await api.getComments(postId);
    if (response.success && response.data) {
      setComments(response.data.comments);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      setToast({ message: '로그인이 필요합니다.', type: 'error' });
      return;
    }

    const response = await api.toggleLike(postId);
    if (response.success && response.data) {
      setPost((prev) => ({
        ...prev,
        isLiked: response.data!.isLiked,
        likeCount: response.data!.likeCount,
      }));
    }
  };

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;

    const response = await api.deletePost(postId);
    if (response.success) {
      setToast({ message: '게시글이 삭제되었습니다.', type: 'success' });
      setTimeout(() => router.push('/posts'), 1000);
    } else {
      setToast({ message: response.error?.message || '삭제에 실패했습니다.', type: 'error' });
    }
  };

  const handleCommentImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxImages = 3;
    const remainingSlots = maxImages - commentImages.length;
    if (remainingSlots <= 0) {
      setToast({ message: `댓글 이미지는 최대 ${maxImages}개까지 업로드할 수 있습니다.`, type: 'error' });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        setToast({ message: '이미지 파일만 업로드할 수 있습니다.', type: 'error' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setToast({ message: '파일 크기는 10MB를 초과할 수 없습니다.', type: 'error' });
        return;
      }
    }

    setIsUploadingImage(true);
    try {
      const results: UploadImageResponse[] = [];
      for (const file of filesToUpload) {
        const response = await api.uploadImage(file);
        if (response.success && response.data) {
          results.push(response.data);
        }
      }
      if (results.length > 0) {
        setCommentImages((prev) => [...prev, ...results]);
      }
    } catch {
      setToast({ message: '이미지 업로드에 실패했습니다.', type: 'error' });
    } finally {
      setIsUploadingImage(false);
      if (commentImageInputRef.current) {
        commentImageInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCommentImage = (index: number) => {
    setCommentImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && commentImages.length === 0) return;

    if (!isAuthenticated) {
      setToast({ message: '로그인이 필요합니다.', type: 'error' });
      return;
    }

    const response = await api.createComment(postId, {
      content: newComment,
      images: commentImages.map((img) => ({
        fileName: img.fileName,
        originalName: img.originalName,
        filePath: img.filePath,
        fileSize: img.fileSize,
        contentType: img.contentType,
      })),
    });
    if (response.success && response.data) {
      setComments((prev) => [...prev, response.data!]);
      setNewComment('');
      setCommentImages([]);
      setPost((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
    }
  };

  const handleCommentEdit = async (commentId: number, content: string) => {
    const response = await api.updateComment(postId, commentId, { content });
    if (response.success && response.data) {
      setComments((prev) => prev.map((c) => (c.id === commentId ? response.data! : c)));
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    const response = await api.deleteComment(postId, commentId);
    if (response.success) {
      setComments((prev) => {
        const rootIndex = prev.findIndex((c) => c.id === commentId);
        if (rootIndex !== -1) {
          return prev.filter((c) => c.id !== commentId);
        }
        return prev.map((c) => ({
          ...c,
          replies: c.replies.filter((r) => r.id !== commentId),
          replyCount: c.replies.filter((r) => r.id !== commentId).length,
        }));
      });
      setPost((prev) => ({ ...prev, commentCount: prev.commentCount - 1 }));
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    const response = await api.createComment(postId, { content, parentId });
    if (response.success && response.data) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...c.replies, response.data!], replyCount: c.replyCount + 1 }
            : c
        )
      );
      setPost((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      <Header title="커뮤니티" />

      <main className="max-w-2xl mx-auto">
        <Card className="shadow-sm border-0 rounded-none">
          <CardContent className="p-4">
            {post.category && (
              <Badge
                variant="secondary"
                className="mb-3"
                style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
              >
                {post.category.name}
              </Badge>
            )}
            <h1 className="text-xl font-bold text-slate-900 mb-4">{post.title}</h1>

            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  {post.author.profileImageUrl ? (
                    <AvatarImage src={api.getImageUrl(post.author.profileImageUrl)} />
                  ) : null}
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {post.author.nickname.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{post.author.nickname}</span>
                    <GradeBadge grade={post.author.grade} showName={false} size="sm" />
                  </div>
                  <span className="text-sm text-slate-400">{formatDate(post.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <Eye className="w-4 h-4" />
                  {post.viewCount}
                </div>
                {showAuthUI && !isAuthor && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowReportModal(true)}
                    className="text-slate-400 hover:text-red-500 h-8 w-8"
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                )}
                {isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/posts/${postId}/edit`} className="flex items-center gap-2">
                          <Edit2 className="w-4 h-4" />
                          수정
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <div className="prose max-w-none mb-6 whitespace-pre-wrap text-slate-700">
              {post.content}
            </div>

            {post.images && post.images.length > 0 && (
              <div className="mb-6">
                <div
                  className={`grid gap-2 ${
                    post.images.length === 1
                      ? 'grid-cols-1'
                      : post.images.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-2 md:grid-cols-3'
                  }`}
                >
                  {post.images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`relative cursor-pointer overflow-hidden rounded-xl bg-slate-100 ${
                        post.images.length === 1 ? 'aspect-video' : 'aspect-square'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={api.getImageUrl(image.filePath)}
                        alt={image.originalName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <div className="flex items-center gap-4">
              <Button
                variant={post.isLiked ? 'default' : 'outline'}
                size="sm"
                onClick={handleLike}
                className={post.isLiked ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                {post.likeCount}
              </Button>
              {showAuthUI && (
                <div className="flex items-center gap-1 text-slate-500">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.commentCount}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 rounded-none mt-2">
          <CardContent className="p-4">
            {showAuthUI ? (
              <>
                <h2 className="font-semibold mb-4">댓글 {comments.length}</h2>

                <div className="divide-y divide-slate-100">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onEdit={handleCommentEdit}
                      onDelete={handleCommentDelete}
                      onReply={handleReply}
                    />
                  ))}
                </div>

                {comments.length === 0 && (
                  <p className="text-center py-8 text-slate-400">아직 댓글이 없습니다.</p>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm mb-3">
                  댓글은 회원만 확인할 수 있어요
                </p>
                <Link href="/login" className="text-blue-700 font-medium text-sm hover:underline">
                  로그인하고 대화에 참여하기 →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {showAuthUI && (
          <form onSubmit={handleCommentSubmit} className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40">
            <div className="max-w-2xl mx-auto">
              {commentImages.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                  {commentImages.map((image, index) => (
                    <div key={image.fileName} className="relative flex-shrink-0 w-16 h-16">
                      <img
                        src={api.getImageUrl(image.filePath)}
                        alt={image.originalName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCommentImage(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={commentImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleCommentImageSelect}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => commentImageInputRef.current?.click()}
                  disabled={isUploadingImage || commentImages.length >= 3}
                  className="text-slate-500"
                >
                  {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                </Button>
                <Input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newComment.trim() && commentImages.length === 0}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

      </main>

      {selectedImageIndex !== null && post.images && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white hover:bg-white/10"
          >
            <X className="w-8 h-8" />
          </Button>

          {selectedImageIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex - 1);
              }}
              className="absolute left-4 text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          <img
            src={api.getImageUrl(post.images[selectedImageIndex].filePath)}
            alt={post.images[selectedImageIndex].originalName}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {selectedImageIndex < post.images.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex + 1);
              }}
              className="absolute right-4 text-white hover:bg-white/10"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {selectedImageIndex + 1} / {post.images.length}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedMemberId={post.author.id}
        reportedNickname={post.author.nickname}
        contentType="POST"
        contentId={post.id}
      />
    </div>
  );
}
