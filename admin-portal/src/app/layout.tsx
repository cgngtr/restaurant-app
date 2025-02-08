'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/ui/toaster';
import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { Sidebar } from '@/components/layout/sidebar';
import { QueryProvider } from '@/providers/query-provider';
import { ParallelDataProvider } from '@/providers/parallel-data-provider';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from "@/providers/theme-provider";

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background`} suppressHydrationWarning>
        <ThemeProvider>
          <SessionProvider>
            <Suspense fallback={<LoadingState />}>
              <QueryProvider>
                <ParallelDataProvider>
                  <div className="flex min-h-screen bg-background">
                    <Sidebar />
                    <div className="flex-1 md:ml-64">
                      <main className="p-8 bg-background">
                        <Suspense fallback={<LoadingState />}>
                          {children}
                        </Suspense>
                      </main>
                    </div>
                  </div>
                </ParallelDataProvider>
              </QueryProvider>
            </Suspense>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
