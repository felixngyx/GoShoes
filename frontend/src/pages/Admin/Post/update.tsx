import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosClient from '../../../apis/axiosClient';
import RichTextEditor from '../../../components/admin/RichTextEditor';
import PageTitle from '../../../components/admin/PageTitle';
import { useNavigate, useParams } from 'react-router-dom';
import * as Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { getPostById } from '../../../services/admin/post';

interface Post {
  id: number;
  title: string;
  content: string;
  image: string;
  category_id: number;
  status: 'draft' | 'published' | 'scheduled';
  scheduled_at: string | null;
  published_at: string | null;
}

interface FormData {
  title: string;
  content: string;
  image: string;
  category_id: string | number;
  scheduled_at: string | null;
  published_at: string | null;
  status: 'draft' | 'published' | 'scheduled';
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      perPage: number;
    };
  };
}

const postSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Title is required',
  }),
  content: Joi.string().allow('').optional(),
  image: Joi.string().required().messages({
    'string.empty': 'Image is required',
  }),
  category_id: Joi.alternatives().try(
    Joi.string(),
    Joi.number()
  ).required().messages({
    'any.required': 'Category is required',
  }),
  published_at: Joi.string().allow(null).optional(),
  scheduled_at: Joi.string().allow(null).optional(),
  status: Joi.string().valid('draft', 'published', 'scheduled').required()
});

const UpdatePost = () => {
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: joiResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      image: '',
      category_id: '',
      status: 'draft',
      published_at: null,
      scheduled_at: null
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postResponse = await getPostById(Number(id));
        if (postResponse.data) {
          const post = postResponse.data;
          reset({
            title: post.title,
            content: post.content,
            image: post.image,
            category_id: post.category_id,
            status: post.status,
            published_at: post.published_at,
            scheduled_at: post.scheduled_at
          });
          setContent(post.content || '');
        }

        const fetchCategories = async () => {
          try {
            const response = await axiosClient.get<CategoryResponse>('/post-categories');
            if (response.data.success) {
              setCategories(response.data.data.categories);
            } else {
              toast.error('Failed to load categories');
            }
          } catch (error) {
            console.error('Categories error:', error);
            toast.error('Failed to load categories');
            setCategories([]);
          }
        };
        
        fetchCategories();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    if (!content) {
      toast.error('Content is required');
      return;
    }

    try {
      setIsLoading(true);
      const loadingToast = toast.loading('Updating post...');

      const postData = {
        title: data.title,
        content: content,
        image: data.image,
        category_id: Number(data.category_id),
        scheduled_at: data.status === 'scheduled' ? data.published_at : null,
        published_at: data.status === 'published' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
        status: data.status
      };

      const response = await axiosClient.put(`/posts/${id}`, postData);
      
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success('Post updated successfully');
        navigate('/admin/posts');
      }
    } catch (error: any) {
      console.error('Update post error:', error);
      toast.error(error.response?.data?.message || 'Error updating post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageTitle title="Update Post | Goshoes" />
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Update Post</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Image</label>
            <input
              type="file"
              {...register('image')}
              className="mt-1 block w-full text-gray-400"
              ref={fileInputRef}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Content</label>
            <RichTextEditor
              initialValue={content}
              onChange={setContent}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Category</label>
            <select
              {...register("category_id", { required: "Please select a category" })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Status</label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Published Date</label>
            <input
              type="datetime-local"
              {...register('published_at')}
              className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Scheduled Date</label>
            <input
              type="datetime-local"
              {...register('scheduled_at')}
              className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 text-white rounded ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isLoading ? 'Processing...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UpdatePost;
