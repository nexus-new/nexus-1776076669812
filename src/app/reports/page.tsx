```tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, RefreshCw } from 'lucide-react';

interface Sale {
  id: string;
  created_at: string;
  total_amount: number;
  user_id: string;
  items: {
    product_name: string;
    quantity: number;
    price_per_unit: number;
  }[];
}

interface Product {
  id: string;
  name: string;
  stock: number;
}

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchReports();
    }
  }, [user, loading, router]);

  const fetchReports = async () => {
    setLoadingReports(true);
    setError(null);
    if (!user) return;

    // Fetch Sales
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('*, items:sale_items(product_name, quantity, price_per_unit)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (salesError) {
      console.error('Error fetching sales for reports:', salesError);
      setError('Sotuv hisobotlarini yuklashda xatolik yuz berdi.');
    } else {
      setSales(salesData || []);
    }

    // Fetch Products (for stock report)
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('user_id', user.id);

    if (productsError) {
      console.error('Error fetching products for reports:', productsError);
      setError((prev) => (prev ? prev + ' Mahsulot hisobotlarini yuklashda ham xatolik.' : 'Mahsulot hisobotlarini yuklashda xatolik yuz berdi.'));
    } else {
      setProducts(productsData || []);
    }
    setLoadingReports(false);
  };

  const calculateTotalSales = () => {
    return sales.reduce((sum, sale) => sum + sale.total_amount, 0).toFixed(2);
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("Yuklab olish uchun ma'lumot yo'q.");
      return;
    }
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(value => `"${value}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || loadingReports) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-xl text-primary">Hisobotlar yuklanmoqda...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-primary">Hisobotlar</h1>
        <motion.button
          onClick={fetchReports}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-secondary hover:bg-primary text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <RefreshCw className="mr-2" /> Yangilash
        </motion.button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-dark-light p-6 rounded-lg shadow-md border border-primary/30"
        >
          <h2 className="text-2xl font-semibold text-text-light mb-4">Umumiy sotuvlar</h2>
          <p className="text-5xl font-bold text-primary">${calculateTotalSales()}</p>
          <p className="text-text-dark mt-2">Jami {sales.length} ta sotuv</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-dark-light p-6 rounded-lg shadow-md border border-primary/30"
        >
          <h2 className="text-2xl font-semibold text-text-light mb-4">Skladdagi mahsulotlar</h2>
          <p className="text-5xl font-bold text-accent">{products.length}</p>
          <p className="text-text-dark mt-2">Jami turdagi mahsulotlar</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-dark-light p-6 rounded-lg shadow-md border border-primary/30 mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-text-light">Sotuvlar ro&apos;yxati</h2>
          <motion.button
            onClick={() => downloadCSV(sales.map(s => ({
              id: s.id,
              created_at: s.created_at,
              total_amount: s.total_amount,
              items: s.items.map(item => `${item.product_name} (${item.quantity}x)`).join('; ')
            })), 'sales_report.csv')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-accent hover:bg-yellow-600 text-dark px-3 py-1 rounded-md flex items-center text-sm transition-colors"
          >
            <Download className="mr-1" size={16} /> CSV
          </motion.button>
        </div>
        {sales.length === 0 ? (
          <p className="text-text-dark">Sotuvlar topilmadi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-dark rounded-lg">
              <thead>
                <tr className="text-left text-primary border-b border-gray-700">
                  <th className="p-3">ID</th>
                  <th className="p-3">Sana</th>
                  <th className="p-3">Umumiy summa</th>
                  <th className="p-3">Mahsulotlar</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-800 hover:bg-dark-light transition-colors">
                    <td className="p-3 text-text-light">{sale.id.substring(0, 8)}...</td>
                    <td className="p-3 text-text-dark">{new Date(sale.created_at).toLocaleString()}</td>
                    <td className="p-3 text-primary font-bold">${sale.total_amount.toFixed(2)}</td>
                    <td className="p-3 text-text-dark">
                      {sale.items.map((item, idx) => (
                        <div key={idx}>{item.product_name} ({item.quantity}x)</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-dark-light p-6 rounded-lg shadow-md border border-primary/30"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-text-light">Sklad hisoboti</h2>
          <motion.button
            onClick={() => downloadCSV(products.map(p => ({
              id: p.id,
              name: p.name,
              stock: p.stock
            })), 'stock_report.csv')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-accent hover:bg-yellow-600 text-dark px-3 py-1 rounded-md flex items-center text-sm transition-colors"
          >
            <Download className="mr-1" size={16} /> CSV
          </motion.button>
        </div>
        {products.length === 0 ? (
          <p className="text-text-dark">Skladda mahsulotlar topilmadi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-dark rounded-lg">
              <thead>
                <tr className="text-left text-primary border-b border-gray-700">
                  <th className="p-3">ID</th>
                  <th className="p-3">Nomi</th>
                  <th className="p-3">Mavjud miqdor</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-800 hover:bg-dark-light transition-colors">
                    <td className="p-3 text-text-light">{product.id.substring(0, 8)}...</td>
                    <td className="p-3 text-text-dark">{product.name}</td>
                    <td className="p-3 text-accent font-bold">{product.stock} dona</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
```