import { useState } from 'react';
import { api } from '../../services/api';
import type { ReportReason, ReportContentType } from '../../types';
import { REPORT_REASON_INFO } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedMemberId: number;
  reportedNickname: string;
  contentType?: ReportContentType;
  contentId?: number;
  onSuccess?: () => void;
}

export function ReportModal({
  isOpen,
  onClose,
  reportedMemberId,
  reportedNickname,
  contentType,
  contentId,
  onSuccess,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('신고 사유를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.reportMember({
        reportedMemberId,
        reason,
        description: description.trim() || undefined,
        contentType,
        contentId,
      });

      if (response.success) {
        alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
        onClose();
        onSuccess?.();
        // Reset form
        setReason('');
        setDescription('');
      } else {
        setError(response.error?.message || '신고 접수에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          회원 신고
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          <span className="font-medium text-gray-900">{reportedNickname}</span> 님을 신고합니다.
        </p>

        <form onSubmit={handleSubmit}>
          {/* 신고 사유 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              신고 사유 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {(Object.keys(REPORT_REASON_INFO) as ReportReason[]).map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={key}
                    checked={reason === key}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {REPORT_REASON_INFO[key]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 상세 설명 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="신고 사유를 상세히 설명해주세요."
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {description.length}/1000
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '신고 중...' : '신고하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
