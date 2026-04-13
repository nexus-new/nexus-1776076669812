```tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2 } from 'lucide-react';

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