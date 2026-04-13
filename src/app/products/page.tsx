```tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  user_id: string;
}

export default function ProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchProducts();
    }
  }, [user, loading, router]);

  const fetchProducts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id); // Only fetch products for the current user

    if (error) {
      console.error('Error fetching products:', error);
      setError('Mahsulotlarni yuklashda xatolik yuz berdi.');
    } else {
      setProducts(data || []);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Foydalanuvchi topilmadi. Iltimos, qayta kiring.');
      return;
    }

    const { name, price, stock } = newProduct;
    if (!name || !price || !stock) {
      setError('Barcha maydonlarni to\'ldiring.');
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, price: parseFloat(price), stock: parseInt(stock), user_id: user.id }])
      .select();

    if (error) {
      console.error('Error adding product:', error);
      setError('Mahsulot qo\'shishda xatolik yuz berdi.');
    } else {
      setProducts([...products, data[0]]);
      setNewProduct({ name: '', price: '', stock: '' });
      setIsModalOpen(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingProduct || !user) {
      setError('Mahsulot topilmadi yoki foydalanuvchi topilmadi.');
      return;
    }

    const { name, price, stock } = editingProduct;
    if (!name || !price || !stock) {
      setError('Barcha maydonlarni to\'ldiring.');
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .update({ name, price: parseFloat(price.toString()), stock: parseInt(stock.toString()) })
      .eq('id', editingProduct.id)
      .eq('user_id', user.id) // Ensure user owns the product
      .select();

    if (error) {
      console.error('Error updating product:', error);
      setError('Mahsulotni yangilashda xatolik yuz berdi.');
    } else {
      setProducts(products.map((p) => (p.id === editingProduct.id ? data[0] : p)));
      setEditingProduct(null);
      setIsModalOpen(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user) {
      setError('Foydalanuvchi topilmadi. Iltimos, qayta kiring.');
      return;
    }
    if (!confirm('Haqiqatan ham bu mahsulotni o\'chirmoqchimisiz?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns the product

    if (error) {
      console.error('Error deleting product:', error);
      setError('Mahsulotni o\'chirishda xatolik yuz berdi.');
    } else {
      setProducts(products.filter((p) => p.id !== id));
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
        <h1 className="text-4xl font-bold text-primary">Mahsulotlar</h1>
        <motion.button
          onClick={() => {
            setEditingProduct(null);
            setNewProduct({ name: '', price: '', stock: '' });
            setIsModalOpen(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <Plus className="mr-2" /> Mahsulot qo&apos;shish
        </motion.button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {products.length === 0 ? (
        <p className="text-text-dark text-lg text-center mt-10">Hozircha mahsulotlar mavjud emas. Yangisini qo&apos;shing!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-dark-light p-6 rounded-lg shadow-md border border-dark-light hover:border-primary transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold text-text-light mb-2">{product.name}</h3>
              <p className="text-text-dark mb-1">Narxi: <span className="font-bold text-primary">${product.price.toFixed(2)}</span></p>
              <p className="text-text-dark mb-4">Sklad: <span className="font-bold text-accent">{product.stock} dona</span></p>
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => {
                    setEditingProduct(product);
                    setNewProduct({ name: product.name, price: product.price.toString(), stock: product.stock.toString() });
                    setIsModalOpen(true);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit size={20} />
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteProduct(product.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={20} />
                </motion.button>
              </div>
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
            className="bg-dark-light p-8 rounded-lg shadow-glow-lg w-full max-w-md border border-primary/50 relative"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-dark hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">
              {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
            </h2>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-text-light text-sm font-bold mb-2">
                  Nomi
                </label>
                <input
                  type="text"
                  id="name"
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline bg-dark"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-text-light text-sm font-bold mb-2">
                  Narxi
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline bg-dark"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="stock" className="block text-text-light text-sm font-bold mb-2">
                  Sklad (dona)
                </label>
                <input
                  type="number"
                  id="stock"
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline bg-dark"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  required
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-300"
              >
                {editingProduct ? 'Yangilash' : 'Qo\'shish'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
```