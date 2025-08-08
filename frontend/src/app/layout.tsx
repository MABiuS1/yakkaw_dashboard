// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from '@/app/ClientLayout'; // 👈 import ที่เราเพิ่งสร้าง

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Yakkaw Dashboard',
  description: '...',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ClientLayout> {/* 👈 wrap children ด้วย ClientLayout */}
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
