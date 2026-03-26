import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { StoreHydration } from '@/shared/lib/StoreHydration'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lumina — Tarot Consultation',
  description: 'Premium tarot consultation. Live and async sessions with master readers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#FDFCF8" />
      </head>
      <body className="bg-ivory-50 font-sans antialiased overscroll-none">
        <StoreHydration />
        {children}
      </body>
    </html>
  )
}
