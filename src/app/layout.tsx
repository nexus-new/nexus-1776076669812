```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Oziq-ovqat Do\'koni Tizimi',
  description: 'Oziq-ovqat do\'konlarini boshqarish tizimi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark text-text-light`}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto p-4 pt-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
```