import Link from 'next/link';

export default function PostNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-xl font-bold text-gray-900 mb-2">게시글을 찾을 수 없습니다</h2>
      <p className="text-gray-500 mb-6">삭제되었거나 존재하지 않는 게시글입니다.</p>
      <Link
        href="/posts"
        className="px-6 py-3 bg-bluewings text-white rounded-xl font-medium hover:bg-bluewings-dark transition-colors"
      >
        목록으로 돌아가기
      </Link>
    </div>
  );
}
