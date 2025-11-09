import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://camp-managment-prd.vercel.app'),
  title: 'Candy Land Midburn 2025',
  description: 'Register for Candy Land at Midburn 2025! Join our community of burners for an unforgettable experience.',
  keywords: ['midburn', 'candy land', 'camp', 'registration', 'burning man', 'israel', '2025'],
  authors: [{ name: 'Candy Land Team' }],
  openGraph: {
    title: 'Candy Land Midburn 2025',
    description: 'Register for Candy Land at Midburn 2025!',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Candy Land Midburn 2025',
    description: 'Register for Candy Land at Midburn 2025!',
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
