```tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

interface Sale {
  id: string;
  created_at: string;
  total_amount: number;
  user_id: string;
  items: SaleItem[];
}

export default function SalesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newSaleItems, setNewSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchSales();
      fetchProductsForSale();
    }
  }, [user, loading, router]);

  const fetchSales = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('sales')
      .select('*, items:sale_items(*)') // Fetch related sale items
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
      setError('Sotuvlarni yuklashda xatolik yuz berdi.');
    } else {
      setSales(data || []);
    }
  };

  const fetchProductsForSale = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching products for sale:', error);
    } else {
      setProducts(data || []);
    }
  };

  const handleAddItemToSale = () => {
    setError(null);
    if (!selectedProductId || quantity <= 0) {
      setError('Mahsulotni tanlang va miqdorni kiriting.');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) {
      setError('Tanlangan mahsulot topilmadi.');
      return;
    }
    if (product.stock < quantity) {
      setError(`Skladda yetarli miqdorda ${product.name} yo'q. Mavjud: ${product.stock}`);
      return;
    }

    const existingItemIndex = newSaleItems.findIndex(item => item.product_id === selectedProductId);

    if (existingItemIndex > -1) {
      // Update existing item
      const updatedItems = [...newSaleItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        setError(`Skladda yetarli miqdorda ${product.name} yo'q. Mavjud: ${product.stock}`);
        return;
      }
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        total_price: newQuantity * product.price,
      };
      setNewSaleItems(updatedItems);
    } else {
      // Add new item
      setNewSaleItems([
        ...newSaleItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: quantity,
          price_per_unit: product.price,
          total_price: quantity * product.price,
        },
      ]);
    }

    setSelectedProductId('');
    setQuantity(1);
  };

  const handleRemoveItemFromSale = (index: number) => {
    setNewSaleItems(newSaleItems.filter((_, i) => i !== index));
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Foydalanuvchi topilmadi. Iltimos, qayta kiring.');
      return;
    }
    if (newSaleItems.length === 0) {
      setError('Sotuvga hech bo\'lmaganda bitta mahsulot qo\'shing.');
      return;
    }

    const totalAmount = newSaleItems.reduce((sum, item) => sum + item.total_price, 0);

    // Start a transaction (Supabase doesn't have explicit transactions, so we handle it manually)
    try {
      // 1. Create the sale record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{ total_amount: totalAmount, user_id: user.id }])
        .select();

      if (saleError) throw saleError;
      const newSale = saleData[0];

      // 2. Insert sale items and update product stock
      for (const item of newSaleItems) {
        // Insert sale item
        const { error: itemError } = await supabase
          .from('sale_items')
          .insert([{
            sale_id: newSale.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_per_unit: item.price_per_unit,
            total_price: item.total_price,
          }]);
        if (itemError) throw itemError;

        // Update product stock
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (productError) throw productError;

        const newStock = productData.stock - item.quantity;
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id);
        if (updateError) throw updateError;
      }

      setNewSaleItems([]);
      setIsModalOpen(false);
      fetchSales(); // Refresh sales list
      fetchProductsForSale(); // Refresh product stock
    } catch (err: any) {
      console.error('Error creating sale:', err);
      setError(`Sotuv yaratishda xatolik yuz berdi: ${err.message}`);
      // Potentially revert changes if transaction fails (more complex for Supabase)
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-primary">Sotuvlar</h1>
        <motion.button
          onClick={() => {
            setNewSaleItems([]);
            setSelectedProductId('');
            setQuantity(1);
            setIsModalOpen(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <Plus className="mr-2" /> Yangi sotuv
        </motion.button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {sales.length === 0 ? (
        <p className="text-text-dark text-lg text-center mt-10">Hozircha sotuvlar mavjud emas. Yangi sotuv yarating!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sales.map((sale) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-dark-light p-6 rounded-lg shadow-md border border-dark-light hover:border-primary transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold text-text-light mb-2">Sotuv ID: {sale.id.substring(0, 8)}...</h3>
              <p className="text-text-dark mb-1">Sana: {new Date(sale.created_at).toLocaleString()}</p>
              <p className="text-text-dark mb-4">Umumiy summa: <span className="font-bold text-primary">${sale.total_amount.toFixed(2)}</span></p>
              <h4 className="text-lg font-semibold text-text-light mb-2">Mahsulotlar:</h4>
              <ul className="list-disc list-inside text-text-dark">
                {sale.items.map((item, index) => (
                  <li key={index}>
                    {item.product_name} ({item.quantity}x) - ${item.total_price.toFixed(2)}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-dark-light p-8 rounded-lg shadow-glow-lg w-full max-w-lg border border-primary/50 relative"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-dark hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">Yangi sotuv yaratish</h2>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

            <div className="mb-6 border-b border-gray-700 pb-4">
              <h3 className="text-xl font-semibold text-text-light mb-4">Mahsulot qo&apos;shish</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label htmlFor="productSelect" className="block text-text-light text-sm font-bold mb-2">
                    Mahsulot
                  </label>
                  <select
                    id="productSelect"
                    className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline bg-dark"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    <option value="">Mahsulotni tanlang</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Narxi: ${product.price.toFixed(2)}, Sklad: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-text-light text-sm font-bold mb-2">
                    Miqdor
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline bg-dark"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
              </div>
              <motion.button
                onClick={handleAddItemToSale}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-accent hover:bg-yellow-600 text-dark font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-300"
              >
                Sotuvga qo&apos;shish
              </motion.button>
            </div>

            <h3 className="text-xl font-semibold text-text-light mb-4">Sotuvdagi mahsulotlar</h3>
            {newSaleItems.length === 0 ? (
              <p className="text-text-dark mb-4">Hech qanday mahsulot qo&apos;shilmagan.</p>
            ) : (
              <ul className="mb-6 space-y-2">
                {newSaleItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center bg-dark p-3 rounded-md">
                    <span className="text-text-light">
                      {item.product_name} ({item.quantity}x) - ${item.total_price.toFixed(2)}
                    </span>
                    <motion.button
                      onClick={() => handleRemoveItemFromSale(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </li>
                ))}
              </ul>
            )}

            <div className="text-right text-2xl font-bold text-primary mb-6">
              Jami: ${newSaleItems.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}
            </div>

            <motion.button
              onClick={handleCreateSale}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-300"
              disabled={newSaleItems.length === 0}
            >
              Sotuvni yakunlash
            </motion.button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
```