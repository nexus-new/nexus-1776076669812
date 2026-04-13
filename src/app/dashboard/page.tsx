```tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      setWelcomeMessage(`Xush kelibsiz, ${user.email}!`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-xl text-primary">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  const dashboardItems = [
    { name: 'Mahsulotlar', icon: <Package size={48} />, link: '/products' },
    { name: 'Sotuvlar', icon: <ShoppingCart size={48} />, link: '/sales' },
    { name: 'Xodimlar', icon: <Users size={48} />, link: '/employees' },
    { name: 'Hisobotlar', icon: <BarChart2 size={48} />, link: '/reports' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[calc(100vh-80px)] p-4"
    >
      <h1 className="text-4xl font-bold text-primary mb-6">{welcomeMessage}</h1>
      <p className="text-xl text-text-light mb-8">Boshqaruv paneliga xush kelibsiz. Do&apos;koningizni boshqarish uchun quyidagi bo&apos;limlardan birini tanlang.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardItems.map((item, index) => (
          <Link href={item.link} key={index} passHref>
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(76, 175, 80, 0.7)' }}
              whileTap={{ scale: 0.98 }}
              className="bg-dark-light p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer border border-dark-light hover:border-primary transition-all duration-300"
            >
              <div className="text-primary mb-4">{item.icon}</div>
              <h2 className="text-2xl font-semibold text-text-light">{item.name}</h2>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
```