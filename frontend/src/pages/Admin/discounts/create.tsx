import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

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
    .required(),
  usage_limit: Joi.number()
    .integer()
    .min(1).message('Usage limit must be greater than 0')
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

const CreateDiscount = () => {
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: joiResolver(createDiscountSchema),
    defaultValues: {
      product_ids: null,
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/discounts`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.data.status) {
        toast.success('Discount created successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 dark">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-base-content">Create New Discount</h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-base-content">Discount Code</span>
              </label>
              <input
                type="text"
                {...register('code')}
                className="input input-bordered w-full bg-base-100 text-base-content"
                placeholder="e.g., SUMMER2024"
              />
              {errors.code && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.code?.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-base-content">Description</span>
              </label>
              <input
                type="text"
                {...register('description')}
                className="input input-bordered w-full bg-base-100 text-base-content"
                placeholder="Discount description"
              />
              {errors.description && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.description?.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-base-content">Valid From</span>
              </label>
              <input
                type="datetime-local"
                {...register('valid_from')}
                className="input input-bordered w-full bg-base-100 text-base-content"
              />
              {errors.valid_from && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.valid_from?.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-base-content">Valid To</span>
              </label>
              <input
                type="datetime-local"
                {...register('valid_to')}
                className="input input-bordered w-full bg-base-100 text-base-content"
              />
              {errors.valid_to && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.valid_to?.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-base-content">Minimum Order Amount</span>
              </label>
              <input
                type="number"
                {...register('min_order_amount', { valueAsNumber: true })}
                className="input input-bordered w-full bg-base-100 text-base-content"
                placeholder="0"
              />
              {errors.min_order_amount && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.min_order_amount?.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-base-content">Usage Limit</span>
              </label>
              <input
                type="number"
                {...register('usage_limit', { valueAsNumber: true })}
                className="input input-bordered w-full bg-base-100 text-base-content"
                placeholder="100"
              />
              {errors.usage_limit && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.usage_limit?.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-base-content">Discount Percentage</span>
              </label>
              <input
                type="number"
                {...register('percent', { valueAsNumber: true })}
                className="input input-bordered w-full bg-base-100 text-base-content"
                placeholder="10"
              />
              {errors.percent && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.percent?.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-base-content">Search Products (Optional)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full bg-base-100 text-base-content"
                placeholder="Search products..."
                onChange={(e) => {
                  // Handle product search
                }}
              />
            </div>
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              type="submit"
              className="btn btn-primary"
            >
              <FiPlus className="mr-2" />
              Create Discount
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateDiscount;
