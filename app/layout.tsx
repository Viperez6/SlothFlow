import type { Metadata } from 'next'
import { DM_Sans, Darker_Grotesque } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const darkerGrotesque = Darker_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SlothFlow - Take it slow, get it done',
  description: 'A calm and focused project management tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${darkerGrotesque.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          expand={true}
          richColors
          toastOptions={{
            style: {
              background: 'hsl(38 35% 97%)',
              border: '1px solid hsl(120 15% 88%)',
              color: 'hsl(120 10% 15%)',
              fontFamily: 'var(--font-sans)',
            },
            classNames: {
              toast: 'shadow-lg rounded-xl',
              title: 'font-display font-semibold',
              description: 'text-sm opacity-80',
            },
          }}
        />
      </body>
    </html>
  )
}
