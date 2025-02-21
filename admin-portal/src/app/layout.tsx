import { Inter } from 'next/font/google'
import './globals.css'
import { headers } from 'next/headers'
import ClientLayout from '@/components/layout/client-layout'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || '/'
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>QR Order Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Script id="extension-handler" strategy="beforeInteractive">
          {`
            // Prevent AudioContext initialization
            if (window.AudioContext || window.webkitAudioContext) {
              const originalAudioContext = window.AudioContext || window.webkitAudioContext;
              window.AudioContext = class extends originalAudioContext {
                constructor(options) {
                  super(options);
                }
              };
              window.webkitAudioContext = window.AudioContext;
            }

            // Clean up browser extension classes
            window.addEventListener('load', function() {
              const body = document.body;
              const originalClasses = body.className.split(' ').filter(cls => 
                !cls.includes('vsc-') && 
                !cls.includes('volumecontrol-')
              );
              body.className = originalClasses.join(' ');
            });
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout isAuthPage={isAuthPage}>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
