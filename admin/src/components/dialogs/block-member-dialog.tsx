'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface BlockMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberNickname: string
  onConfirm: (reason: string) => void
  isLoading?: boolean
}

export function BlockMemberDialog({
  open,
  onOpenChange,
  memberNickname,
  onConfirm,
  isLoading,
}: BlockMemberDialogProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(reason)
    setReason('')
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>회원 차단</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{memberNickname}</strong> 회원을 차단하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="reason">차단 사유</Label>
          <Textarea
            id="reason"
            placeholder="차단 사유를 입력하세요..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2"
            rows={3}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            차단
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
