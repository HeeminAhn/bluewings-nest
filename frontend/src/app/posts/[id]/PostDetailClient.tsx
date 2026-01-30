'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
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
} from 'lucide-react';
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
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const commentImageInputRef = useRef<HTMLInputElement>(null);

  const isAuthor = _hasHydrated && member?.id === post.author.id;
  const showAuthUI = _hasHydrated && isAuthenticated;

  // 댓글은 클라이언트에서 fetch (인증 상태에 따라 다를 수 있음)
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 인증 사용자의 경우 좋아요 상태 갱신
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      refreshPost();
    }
  }, [_hasHydrated, isAuthenticated]);

  const refreshPost = async () => {
    // skipViewCount=true로 호출하여 조회수 중복 증가 방지
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white sticky top-0 z-40 border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.push('/posts')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1">
            {showAuthUI && !isAuthor && (
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500"
                title="신고하기"
              >
                <Flag className="w-5 h-5" />
              </button>
            )}
            {isAuthor && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-6 h-6" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[100px]">
                    <Link
                      href={`/posts/${postId}/edit`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                    >
                      <Edit2 className="w-4 h-4" />
                      수정
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 w-full whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-24">
        <article className="bg-white p-4">
          {post.category && (
            <span className="inline-block px-2 py-0.5 text-xs font-medium text-bluewings bg-bluewings/10 rounded-full mb-2">
              {post.category.name}
            </span>
          )}
          <h1 className="text-xl font-bold text-gray-900 mb-4">{post.title}</h1>

          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              {post.author.profileImageUrl ? (
                <img
                  src={api.getImageUrl(post.author.profileImageUrl)}
                  alt={post.author.nickname}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-bluewings-light to-bluewings rounded-full flex items-center justify-center text-white font-bold">
                  {post.author.nickname.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{post.author.nickname}</span>
                  <GradeBadge grade={post.author.grade} showName={false} size="sm" />
                </div>
                <span className="text-sm text-gray-400">{formatDate(post.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.viewCount}
              </span>
            </div>
          </div>

          <div className="prose max-w-none mb-6 whitespace-pre-wrap">{post.content}</div>

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
                    className={`relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 ${
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

          <div className="flex items-center gap-4 py-4 border-t">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                post.isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{post.likeCount}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentCount}</span>
            </div>
          </div>
        </article>

        <section className="bg-white mt-2 p-4">
          <h2 className="font-semibold mb-4">댓글 {comments.length}</h2>

          <div className="divide-y">
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

          {comments.length === 0 && <p className="text-center py-8 text-gray-400">아직 댓글이 없습니다.</p>}
        </section>

        {showAuthUI && (
          <form onSubmit={handleCommentSubmit} className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
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
                <button
                  type="button"
                  onClick={() => commentImageInputRef.current?.click()}
                  disabled={isUploadingImage || commentImages.length >= 3}
                  className="p-3 text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-50"
                >
                  {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-bluewings/30"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() && commentImages.length === 0}
                  className="p-3 bg-bluewings text-white rounded-full disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        )}

        {!showAuthUI && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 text-center">
            <Link href="/login" className="text-bluewings font-medium">
              로그인하고 댓글을 작성하세요
            </Link>
          </div>
        )}
      </main>

      {selectedImageIndex !== null && post.images && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>

          {selectedImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex - 1);
              }}
              className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
          )}

          <img
            src={api.getImageUrl(post.images[selectedImageIndex].filePath)}
            alt={post.images[selectedImageIndex].originalName}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {selectedImageIndex < post.images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex + 1);
              }}
              className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full rotate-180"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
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
