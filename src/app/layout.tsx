import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Midburn Camp Registration',
  description: 'Register for our amazing camp at Midburn 2024! Join our community of burners for an unforgettable experience.',
  keywords: ['midburn', 'camp', 'registration', 'burning man', 'israel'],
  authors: [{ name: 'Midburn Camp Team' }],
  openGraph: {
    title: 'Midburn Camp Registration',
    description: 'Register for our amazing camp at Midburn 2024!',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Midburn Camp Registration',
    description: 'Register for our amazing camp at Midburn 2024!',
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
