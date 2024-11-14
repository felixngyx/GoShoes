import React, { useState } from 'react';
import { Search, ChevronDown, MoreHorizontal, Filter } from 'lucide-react';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@mui/material';

// Create API instance outside component to avoid recreation on each render
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
});

// Setup request interceptor outside component
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Separate API function for better organization
const fetchDiscounts = async () => {
  const response = await api.get('/discounts');
  return response.data;
};

const DiscountList = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Updated React Query implementation
  const { data, isLoading, error } = useQuery({
    queryKey: ['discounts'],
    queryFn: fetchDiscounts,
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || 'Failed to fetch discounts');
    }
  });

  // React Hook Form setup for search
  const { register, watch } = useForm({
    defaultValues: {
      search: ''
    }
  });

  const searchTerm = watch('search');

  // Filter discounts based on search
  const filteredDiscounts = data?.data?.data?.filter(discount => 
    discount.code.toLowerCase().includes(searchTerm?.toLowerCase() || '') ||
    discount.description.toLowerCase().includes(searchTerm?.toLowerCase() || '')
  ) || [];

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status helpers
  const getStatusColor = (validFrom, validTo) => {
    const now = new Date();
    const startDate = new Date(validFrom);
    const endDate = new Date(validTo);

    if (now < startDate) return 'bg-yellow-100 text-yellow-700';
    if (now > endDate) return 'bg-red-100 text-red-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (validFrom, validTo) => {
    const now = new Date();
    const startDate = new Date(validFrom);
    const endDate = new Date(validTo);

    if (now < startDate) return 'Scheduled';
    if (now > endDate) return 'Expired';
    return 'Active';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent"
        />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-6">
        <CardContent>
          <div className="text-red-600">Error: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 bg-white/80 dark:bg-gray-800/80">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            {...register('search')}
            type="text"
            placeholder="Search discounts by name or code..."
            className="pl-10 pr-4 py-2 border rounded-lg w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80"
          />
        </div>
        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            <MoreHorizontal className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg border"
      >
        <table className="w-full bg-white/80 dark:bg-gray-800/80">
          <thead>
            <tr className="border-b">
              <th className="w-12 px-4 py-3">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <div className="flex items-center gap-1">
                  Status
                  <ChevronDown className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Valid From</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Valid To</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Discount</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Used</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredDiscounts.map((discount) => (
              <motion.tr 
                key={discount.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: '#f9fafb' }}
                className="border-b last:border-b-0"
              >
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-4 py-3 text-sm font-mono">{discount.code}</td>
                <td className="px-4 py-3 text-sm">{discount.description}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                    ${getStatusColor(discount.valid_from, discount.valid_to)}
                  `}>
                    {getStatusText(discount.valid_from, discount.valid_to)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{formatDate(discount.valid_from)}</td>
                <td className="px-4 py-3 text-sm">{formatDate(discount.valid_to)}</td>
                <td className="px-4 py-3 text-sm">{discount.percent}%</td>
                <td className="px-4 py-3 text-sm">{discount.used_count}/{discount.usage_limit}</td>
                <td className="px-4 py-3">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {isFilterOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-16 right-6 bg-white border rounded-lg shadow-lg p-4 w-64 z-10 mt-32"
        >
          <div className="space-y-3">
            <div className="font-medium">Filters</div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span>Code</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span>Description</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span>Status</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span>Valid Period</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span>Discount Amount</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span>Usage Count</span>
            </label>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DiscountList;