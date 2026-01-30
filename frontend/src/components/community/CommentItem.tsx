import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, MessageSquare, CornerDownRight, X, Flag } from 'lucide-react';
import type { Comment } from '../../types';
import { GradeBadge } from '../member/GradeBadge';
import { ReportModal } from '../common';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

interface CommentItemProps {
  comment: Comment;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onReply?: (parentId: number, content: string) => void;
  isReply?: boolean;
}

export function CommentItem({ comment, onEdit, onDelete, onReply, isReply = false }: CommentItemProps) {
  const { member, isAuthenticated } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const isAuthor = member?.id === comment.author.id;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleReply = () => {
    if (replyContent.trim() && onReply) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  return (
    <div className={`py-4 ${isReply ? 'pl-6 border-l-2 border-gray-100 ml-4' : 'border-b border-gray-100 last:border-0'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isReply && <CornerDownRight className="w-4 h-4 text-gray-400" />}
          {comment.author.profileImageUrl ? (
            <img
              src={api.getImageUrl(comment.author.profileImageUrl)}
              alt={comment.author.nickname}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 bg-gradient-to-br from-bluewings-light to-bluewings rounded-full flex items-center justify-center text-white text-xs font-bold">
              {comment.author.nickname.charAt(0)}
            </div>
          )}
          <span className="font-medium text-gray-900">{comment.author.nickname}</span>
          <GradeBadge grade={comment.author.grade} showName={false} size="sm" />
          <span className="text-sm text-gray-400">{formatDate(comment.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* 신고 버튼 (본인 댓글 아닐 때만) */}
          {isAuthenticated && !isAuthor && (
            <button
              onClick={() => setShowReportModal(true)}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500"
              title="신고하기"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
          {/* 수정/삭제 메뉴 (본인 댓글일 때만) */}
          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[100px]">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full whitespace-nowrap"
                  >
                    <Edit2 className="w-4 h-4" />
                    수정
                  </button>
                  <button
                    onClick={() => {
                      onDelete(comment.id);
                      setShowMenu(false);
                    }}
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

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-bluewings/30"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 text-sm bg-bluewings text-white rounded-lg hover:bg-bluewings-dark"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>

          {/* 댓글 이미지 */}
          {comment.images && comment.images.length > 0 && (
            <div className="mt-3">
              <div className={`grid gap-2 ${
                comment.images.length === 1 ? 'grid-cols-1 max-w-xs' :
                comment.images.length === 2 ? 'grid-cols-2 max-w-sm' :
                'grid-cols-3 max-w-md'
              }`}>
                {comment.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 aspect-square"
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

          {/* 답글 버튼 (대댓글이 아닌 경우만 표시) */}
          {!isReply && isAuthenticated && onReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 mt-2 text-sm text-gray-500 hover:text-bluewings"
            >
              <MessageSquare className="w-4 h-4" />
              답글 {comment.replyCount > 0 && `(${comment.replyCount})`}
            </button>
          )}
        </>
      )}

      {/* 답글 입력 */}
      {isReplying && (
        <div className="mt-3 space-y-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="답글을 입력하세요..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-bluewings/30 text-sm"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsReplying(false);
                setReplyContent('');
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>
            <button
              onClick={handleReply}
              disabled={!replyContent.trim()}
              className="px-3 py-1.5 text-sm bg-bluewings text-white rounded-lg hover:bg-bluewings-dark disabled:opacity-50"
            >
              답글 작성
            </button>
          </div>
        </div>
      )}

      {/* 대댓글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onEdit={onEdit}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}

      {/* 이미지 모달 */}
      {selectedImageIndex !== null && comment.images && (
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
          <img
            src={api.getImageUrl(comment.images[selectedImageIndex].filePath)}
            alt={comment.images[selectedImageIndex].originalName}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {comment.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {selectedImageIndex + 1} / {comment.images.length}
            </div>
          )}
        </div>
      )}

      {/* 신고 모달 */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedMemberId={comment.author.id}
        reportedNickname={comment.author.nickname}
        contentType="COMMENT"
        contentId={comment.id}
      />
    </div>
  );
}
