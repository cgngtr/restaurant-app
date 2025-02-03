'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/ui/toaster';
import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { Sidebar } from '@/components/layout/sidebar';
import { QueryProvider } from '@/providers/query-provider';
import { ParallelDataProvider } from '@/providers/parallel-data-provider';

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
      <body className={inter.className} suppressHydrationWarning>
        <Suspense fallback={<LoadingState />}>
          <QueryProvider>
            <ParallelDataProvider>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 md:ml-64">
                  <main className="p-8">
                    <Suspense fallback={<LoadingState />}>
                      {children}
                    </Suspense>
                  </main>
                </div>
              </div>
            </ParallelDataProvider>
            <Toaster />
          </QueryProvider>
        </Suspense>
      </body>
    </html>
  );
}
