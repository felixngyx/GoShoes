import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiPlus, FiCalendar, FiTag, FiPercent, FiShoppingCart, FiX, FiSearch, FiChevronRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

type Product = {
  id: number;
  name: string;
  sku: string;
};

const createDiscountSchema = Joi.object({
  code: Joi.string()
    .min(3).message('Discount code must be at least 3 characters')
    .max(50).message('Discount code cannot exceed 50 characters')
    .pattern(/^[A-Z0-9]+$/).message('Discount code can only contain uppercase letters and numbers')
    .required(),
  description: Joi.string()
    .min(5).message('Description must be at least 5 characters')
    .max(200).message('Description cannot exceed 200 characters')
    .required(),
  valid_from: Joi.string().required(),
  valid_to: Joi.string().required(),
  min_order_amount: Joi.number()
    .min(0).message('Minimum order amount cannot be negative')
    .max(99999999.99).message('Minimum order amount is too large')
    .precision(2)
    .required(),
  usage_limit: Joi.number()
    .integer()
    .min(1).message('Usage limit must be greater than 0')
    .max(999999).message('Usage limit is too large')
    .required(),
  percent: Joi.number()
    .min(0).message('Discount percentage cannot be negative')
    .max(100).message('Discount percentage cannot exceed 100%')
    .required(),
  product_ids: Joi.array().items(Joi.number()).allow(null)
});

type FormData = {
  code: string;
  description: string;
  valid_from: string;
  valid_to: string;
  min_order_amount: number;
  usage_limit: number;
  percent: number;
  product_ids: number[] | null;
};

const ProductSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelectProducts, 
  selectedProducts 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectProducts: (products: Product[]) => void;
  selectedProducts: Product[];
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [localSelectedProducts, setLocalSelectedProducts] = useState<Product[]>(selectedProducts);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/products`, {
          params: {
            name: term
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      setSearchResults(response.data.data.products || []);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    }
  };

  const toggleProduct = (product: Product) => {
    setLocalSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleSave = () => {
    onSelectProducts(localSelectedProducts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Select Products</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Enter product name..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Products List */}
        <div className="max-h-96 overflow-y-auto mb-4">
          {searchResults.map(product => (
            <div
              key={product.id}
              onClick={() => toggleProduct(product)}
              className="flex items-center p-3 hover:bg-gray-700 cursor-pointer rounded-lg mb-2"
            >
              <input
                type="checkbox"
                checked={localSelectedProducts.some(p => p.id === product.id)}
                onChange={() => {}}
                className="mr-3"
              />
              <div className="flex flex-col">
                <span className="text-white">{product.name}</span>
                <span className="text-gray-400 text-sm">SKU: {product.sku}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Products Count */}
        <div className="text-gray-400 mb-4">
          Selected: {localSelectedProducts.length} products
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Selection
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateDiscount = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: joiResolver(createDiscountSchema),
    defaultValues: {
      product_ids: null,
    }
  });

  const handleSelectProducts = (products: Product[]) => {
    setSelectedProducts(products);
    setValue('product_ids', products.map(p => p.id));
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase();
    setValue('code', upperValue);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };

      // Xử lý số thập phân với 2 chữ số sau dấu phẩy
      const min_order_amount = Number(parseFloat(data.min_order_amount.toString()).toFixed(2));
      const usage_limit = Math.min(Number(data.usage_limit), 999999);
      const percent = Number(parseFloat(data.percent.toString()).toFixed(2));

      const discountData = {
        code: data.code.trim().toUpperCase(),
        description: data.description.trim(),
        valid_from: formatDate(data.valid_from),
        valid_to: formatDate(data.valid_to),
        min_order_amount: min_order_amount, // Số thập phân với 2 chữ số sau dấu phẩy
        usage_limit: usage_limit,
        percent: percent, // Số thập phân với 2 chữ số sau dấu phẩy
        product_ids: data.product_ids || []
      };

      console.log('Sending discount data:', discountData);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/discounts`,
        discountData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('access_token')}`
          }
        }
      );

      if (response.data.status) {
        toast.success('Discount created successfully!');
        navigate('/admin/discounts');
      }

    } catch (error: any) {
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'An error occurred!');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link 
          to="/admin/discounts" 
          className="hover:text-white transition-colors"
        >
          Discounts
        </Link>
        <FiChevronRight className="h-4 w-4" />
        <span className="text-white">Create Discount</span>
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl px-8 py-10 mx-auto">
        <h1 className="text-3xl font-bold text-white flex items-center mb-6">
          <FiTag className="mr-3" />
          Create New Discount
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FiTag className="mr-2" /> Discount Code
              </label>
              <input
                type="text"
                {...register('code')}
                onChange={(e) => {
                  register('code').onChange(e);
                  handleCodeChange(e);
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                placeholder="e.g., SUMMER2024"
              />
              {errors.code && (
                <p className="text-red-500 text-xs mt-1">{errors.code?.message}</p>
              )}
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FiShoppingCart className="mr-2" /> Description
              </label>
              <input
                type="text"
                {...register('description')}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                placeholder="Enter discount description"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description?.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FiCalendar className="mr-2" /> Valid From
              </label>
              <input
                type="datetime-local"
                {...register('valid_from')}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
              />
              {errors.valid_from && (
                <p className="text-red-500 text-xs mt-1">{errors.valid_from?.message}</p>
              )}
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FiCalendar className="mr-2" /> Valid To
              </label>
              <input
                type="datetime-local"
                {...register('valid_to')}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
              />
              {errors.valid_to && (
                <p className="text-red-500 text-xs mt-1">{errors.valid_to?.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FiShoppingCart className="mr-2" /> Minimum Order Amount
              </label>
              <input
                type="number"
                {...register('min_order_amount', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                placeholder="0"
              />
              {errors.min_order_amount && (
                <p className="text-red-500 text-xs mt-1">{errors.min_order_amount?.message}</p>
              )}
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FiTag className="mr-2" /> Usage Limit
              </label>
              <input
                type="number"
                {...register('usage_limit', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                placeholder="100"
              />
              {errors.usage_limit && (
                <p className="text-red-500 text-xs mt-1">{errors.usage_limit?.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FiPercent className="mr-2" /> Discount Percentage
              </label>
              <input
                type="number"
                {...register('percent', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                placeholder="10"
              />
              {errors.percent && (
                <p className="text-red-500 text-xs mt-1">{errors.percent?.message}</p>
              )}
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selected Products
              </label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedProducts.map(product => (
                  <div key={product.id} 
                       className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    {product.name}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full"
              >
                Select Products
              </button>

              <ProductSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectProducts={handleSelectProducts}
                selectedProducts={selectedProducts}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center"
            >
              <FiPlus className="mr-2" />
              Create Discount
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDiscount;