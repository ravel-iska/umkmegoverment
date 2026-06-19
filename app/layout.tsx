import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { DevSwitcher } from '@/components/dev-switcher'
import { LiveChatBubble } from '@/components/chat/live-chat'
import { getSession } from '@/lib/session'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pasar Podosari - Marketplace Desa',
  description: 'Platform marketplace digital untuk produk lokal UMKM Desa Podosari, Lampung. Temukan keunikan produk lokal desa.',
  keywords: ['marketplace', 'UMKM', 'produk lokal', 'Podosari', 'Lampung', 'desa'],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession();

  return (
    <html lang="id">
      <body className="font-sans antialiased">
        {children}
        <DevSwitcher />
        <LiveChatBubble currentUserId={session?.id} />
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
