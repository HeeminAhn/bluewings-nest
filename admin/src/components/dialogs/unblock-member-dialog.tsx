'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface UnblockMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberNickname: string
  onConfirm: () => void
  isLoading?: boolean
}

export function UnblockMemberDialog({
  open,
  onOpenChange,
  memberNickname,
  onConfirm,
  isLoading,
}: UnblockMemberDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>차단 해제</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{memberNickname}</strong> 회원의 차단을 해제하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            차단 해제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
