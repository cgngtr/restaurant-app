import { Toaster } from '@/components/ui/toaster'

export default function TableLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <Toaster />
    </div>
  )
} 