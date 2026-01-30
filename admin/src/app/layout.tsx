import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "블루윙즈 관리자",
  description: "수원 삼성 블루윙즈 팬 커뮤니티 관리자",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  )
}
