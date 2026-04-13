```tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  contact_info: string;
  user_id: string; // Owner of this employee record
}

export default function EmployeesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', contact_info: '' });
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchEmployees();
    }
  }, [user, loading, router]);

  const fetchEmployees = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id); // Only fetch employees for the current user

    if (error) {
      console.error('Error fetching employees:', error);
      setError('Xodimlarni yuklashda xatolik yuz berdi.');
    } else {
      setEmployees(data || []);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Foydalanuvchi topilmadi. Iltimos, qayta kiring.');
      return;
    }

    const { name, role, contact_info } = newEmployee;
    if (!name || !role || !contact_info) {
      setError('Barcha maydonlarni to\'ldiring.');
      return;
    }

    const { data, error } = await supabase
      .from('employees')
      .insert([{ name, role, contact_info, user_id: user.id }])
      .select();

    if (error) {
      console.error('Error adding employee:', error);
      setError('Xodim qo\'shishda xatolik yuz berdi.');
    } else {
      setEmployees([...employees, data[0]]);
      setNewEmployee({ name: '', role: '', contact_info: '' });
      setIsModalOpen(false);
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingEmployee || !user) {
      setError('Xodim topilmadi yoki foydalanuvchi topilmadi.');
      return;
    }

    const { name, role, contact_info } = editingEmployee;
    if (!name || !role || !contact_info) {
      setError('Barcha maydonlarni to\'ldiring.');
      return;
    }

    const { data, error } = await supabase
      .from('employees')
      .update({ name, role, contact_info })