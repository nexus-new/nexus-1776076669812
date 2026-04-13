```tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20 max-w-4xl"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary shadow-glow-lg"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        >
          Oziq-ovqat Do&apos;koni Boshqaruvi
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-text-dark mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Do&apos;koningizni samarali boshqaring, sotuvlarni kuzating va xodimlarni nazorat qiling.
        </motion.p>
        <motion.div
          className="flex justify-center space-x-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          {!user ? (
            <>
              <Link href="/auth/login" passHref>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(76, 175, 80, 0.7)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-primary text-white rounded-full text-lg font-semibold hover:bg-secondary transition-all duration-300 shadow-glow-sm"
                >
                  Kirish
                </motion.button>
              </Link>
              <Link href="/auth/signup" passHref>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(139, 195, 74, 0.7)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 border border-secondary text-secondary rounded-full text-lg font-semibold hover:bg-secondary hover:text-white transition-all duration-300 shadow-glow-sm"
                >
                  Ro&apos;yxatdan o&apos;tish
                </motion.button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard" passHref>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(76, 175, 80, 0.7)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-primary text-white rounded-full text-lg font-semibold hover:bg-secondary transition-all duration-300 shadow-glow-sm"
              >
                Boshqaruv paneliga o&apos;tish
              </motion.button>
            </Link>
          )}
        </motion.div>
      </motion.section>
    </div>
  );
}
```