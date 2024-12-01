import { useState, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set, get } from 'firebase/database';
import { db } from '../services/firebase';
import { Earning } from '../types';
import { updateMetadata } from '../utils/metadata';

type Category = 'Repair' | 'Installation' | 'Tips' | 'Other';
const categories = ['Repair', 'Installation', 'Tips', 'Other'] as const;

export function AddEarning() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerLocation: '',
    category: 'Repair' as Category,
    description: '',
    timeWorked: '',
    timeAmount: '',
    materialAmount: '',
    tips: '',
  });

  // Calculate total earnings
  const totalEarnings = useMemo(() => {
    const timeAmount = parseFloat(formData.timeAmount) || 0;
    const materialAmount = parseFloat(formData.materialAmount) || 0;
    const tips = parseFloat(formData.tips) || 0;
    return timeAmount + materialAmount + tips;
  }, [formData.timeAmount, formData.materialAmount, formData.tips]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'symbol'
    }).format(value).replace('EUR', '€');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const timeWorked = parseFloat(formData.timeWorked) || 0;
      const timeAmount = parseFloat(formData.timeAmount) || 0;
      const materialAmount = parseFloat(formData.materialAmount) || 0;
      const tips = parseFloat(formData.tips) || 0;

      // Validate all numeric values
      if (timeWorked < 0) {
        setError('Hours worked cannot be negative');
        return;
      }

      if (timeAmount < 0) {
        setError('Time amount cannot be negative');
        return;
      }

      if (materialAmount < 0) {
        setError('Material amount cannot be negative');
        return;
      }

      if (tips < 0) {
        setError('Tips cannot be negative');
        return;
      }

      const newEarning: Omit<Earning, 'id'> = {
        date: formData.date,
        customerName: formData.customerName.trim(),
        customerLocation: formData.customerLocation.trim(),
        category: formData.category,
        description: formData.description.trim(),
        timeWorked,
        timeAmount,
        materialAmount,
        tips,
        totalEarnings: timeAmount + materialAmount + tips,
        createdAt: new Date().toISOString(),
      };

      // Add to earnings list
      const earningRef = ref(db, `users/${user.id}/earnings`);
      const newEarningRef = push(earningRef);
      await set(newEarningRef, newEarning);

      // Update monthly data
      const date = new Date(formData.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthlyRef = ref(db, `users/${user.id}/monthly/${monthKey}`);
      const monthlySnapshot = await get(monthlyRef);
      const monthlyData = monthlySnapshot.val() || { totalEarnings: 0, count: 0 };
      
      await set(monthlyRef, {
        totalEarnings: monthlyData.totalEarnings + newEarning.totalEarnings,
        count: monthlyData.count + 1
      });

      // Update metadata
      await updateMetadata(user.id, newEarning);

      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding earning:', error);
      setError('Failed to add earning. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Add Earning</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Customer Name
              </label>
              <input
                type="text"
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label htmlFor="customerLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Customer Location
              </label>
              <input
                type="text"
                id="customerLocation"
                value={formData.customerLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, customerLocation: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>

          {/* Category and Description */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>

          {/* Time and Amounts */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="timeWorked" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hours Worked
              </label>
              <input
                type="number"
                id="timeWorked"
                value={formData.timeWorked}
                onChange={(e) => setFormData(prev => ({ ...prev, timeWorked: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                min="0"
                step="0.5"
                required
              />
            </div>
            <div>
              <label htmlFor="timeAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Labor Amount
              </label>
              <input
                type="number"
                id="timeAmount"
                value={formData.timeAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, timeAmount: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="materialAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Material Amount
              </label>
              <input
                type="number"
                id="materialAmount"
                value={formData.materialAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, materialAmount: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="tips" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tips
              </label>
              <input
                type="number"
                id="tips"
                value={formData.tips}
                onChange={(e) => setFormData(prev => ({ ...prev, tips: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Earnings</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalEarnings)}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm mt-2">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {isSubmitting ? 'Adding...' : 'Add Earning'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
