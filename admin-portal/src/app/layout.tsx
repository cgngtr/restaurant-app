import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Table as TableIcon, 
  Utensils,
  Settings,
  Menu
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "QR Order Admin",
  description: "Admin portal for QR Order App",
};

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tables', href: '/tables', icon: TableIcon },
  { name: 'Menu', href: '/menu', icon: Menu },
  { name: 'Orders', href: '/orders', icon: Utensils },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="flex min-h-screen bg-gray-100">
          {/* Sidebar */}
          <div className="hidden md:block fixed inset-y-0 left-0 w-64 bg-gray-900">
            <div className="flex flex-col h-screen">
              <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900 border-b border-gray-800">
                <h1 className="text-xl font-bold text-white">QR Order Admin</h1>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-4 py-4 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          'text-gray-300 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 md:ml-64">
            <main className="p-8">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
