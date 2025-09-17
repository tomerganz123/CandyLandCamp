import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://camp-managment-prd.vercel.app'),
  title: 'BABA ZMAN Midburn 2025',
  description: 'Register for BABA ZMAN at Midburn 2025! Join our community of burners for an unforgettable experience.',
  keywords: ['midburn', 'baba zman', 'camp', 'registration', 'burning man', 'israel', '2025'],
  authors: [{ name: 'BABA ZMAN Team' }],
  openGraph: {
    title: 'BABA ZMAN Midburn 2025',
    description: 'Register for BABA ZMAN at Midburn 2025!',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BABA ZMAN Midburn 2025',
    description: 'Register for BABA ZMAN at Midburn 2025!',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-orange-50 to-red-50`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
