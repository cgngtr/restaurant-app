import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BackToTop } from "@/components/ui/back-to-top";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Order App",
  description: "Order food and drinks directly from your table",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={inter.className}
        suppressHydrationWarning
      >
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
