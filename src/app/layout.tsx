import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '共情剧场 - AI Psychodrama Sandplay',
  description: '通过AI角色扮演，探索社交场景，实现自我觉察',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-pixel-dark">
        {children}
      </body>
    </html>
  )
}
