```typescript
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, LayoutDashboard, ShoppingCart, Package, Users, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120 }}
      className="fixed top-0 left-0 right-0 bg-dark-light shadow-md z-50 p-4"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:text-secondary transition-colors">
          FoodStore
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <NavLink href="/dashboard">
                <LayoutDashboard className="inline-block mr-1" size={18} /> Dashboard
              </NavLink>
              <NavLink href="/products">
                <Package className="inline-block mr-1" size={18} /> Mahsulotlar
              </NavLink>
              <NavLink href="/sales">
                <ShoppingCart className="inline-block mr-1" size={18} /> Sotuvlar
              </NavLink>
              <NavLink href="/employees">
                <Users className="inline-block mr-1" size={18} /> Xodimlar
              </NavLink>
              <NavLink href="/reports">
                <BarChart2 className="inline-block mr-1" size={18} /> Hisobotlar
              </NavLink>
              <span className="text-text-dark text-sm hidden md:block">
                <User className="inline-block mr-1" size={18} /> {user.email}
              </span>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut className="inline-block mr-1" size={18} /> Chiqish
              </motion.button>
            </>
          ) : (
            <>
              <NavLink href="/auth/login">Kirish</NavLink>
              <NavLink href="/auth/signup">Ro&apos;yxatdan o&apos;tish</NavLink>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-text-light hover:text-primary transition-colors px-3 py-2 rounded-md">
      {children}
    </Link>
  );
}
```