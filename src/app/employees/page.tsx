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
      .eq('id', editingEmployee.id)
      .eq('user_id', user.id) // Ensure user owns the employee record
      .select();

    if (error) {
      console.error('Error updating employee:', error);
      setError('Xodimni yangilashda xatolik yuz berdi.');
    } else {
      setEmployees(employees.map((emp) => (emp.id === editingEmployee.id ? data[0] : emp)));
      setEditingEmployee(null);
      setIsModalOpen(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!user) {
      setError('Foydalanuvchi topilmadi. Iltimos, qayta kiring.');
      return;
    }
    if (!confirm('Haqiqatan ham bu xodimni o\'chirmoqchimisiz?')) return;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns the employee record

    if (error) {
      console.error('Error deleting employee:', error);
      setError('Xodimni o\'chirishda xatolik yuz berdi.');
    } else {
      setEmployees(employees.filter((emp) => emp.id !== id));
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
        <h1 className="text-4xl font-bold text-primary">Xodimlar</h1>
        <motion.button
          onClick={() => {
            setEditingEmployee(null);
            setNewEmployee({ name: '', role: '', contact_info: '' });
            setIsModalOpen(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <Plus className="mr-2" /> Xodim qo&apos;shish
        </motion.button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {employees.length === 0 ? (
        <p className="text-text-dark text-lg text-center mt-10">Hozircha xodimlar mavjud emas. Yangisini qo&apos;shing!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-dark-light p-6 rounded-lg shadow-md border border-dark-light hover:border-primary transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold text-text-light mb-2">{employee.name}</h3>
              <p className="text-text-dark mb-1">Lavozim: <span className="font-bold text-accent">{employee.role}</span></p>
              <p className="text-text-dark mb-4">Aloqa: {employee.contact_info}</p>
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => {
                    setEditingEmployee(employee);
                    setNewEmployee({ name: employee.name, role: employee.role, contact_info: employee.contact_info });
                    setIsModalOpen(true);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit size={20} />
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteEmployee(employee.id)}
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
              {editingEmployee ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}
            </h2>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <form onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-text-light text-sm font-bold mb-2">
                  Ism Familiya
                </label>
                <input
                  type="text"
                  id="name"
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline bg-dark"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-text-light text-sm font-bold mb-2">
                  Lavozim
                </label>
                <input
                  type="text"
                  id="role"
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline bg-dark"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="contact_info" className="block text-text-light text-sm font-bold mb-2">
                  Aloqa ma&apos;lumotlari (Telefon/Email)
                </label>
                <input
                  type="text"
                  id="contact_info"
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline bg-dark"
                  value={newEmployee.contact_info}
                  onChange={(e) => setNewEmployee({ ...newEmployee, contact_info: e.target.value })}
                  required
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-300"
              >
                {editingEmployee ? 'Yangilash' : 'Qo\'shish'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
```