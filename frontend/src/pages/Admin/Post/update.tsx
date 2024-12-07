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

interface Editor {
  getContent: () => string;
  setContent: (content: string) => void;
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
  })
});

const FormSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-white/10 rounded"></div>
        <div className="h-10 w-20 bg-white/10 rounded"></div>
      </div>

      {/* Title skeleton */}
      <div>
        <div className="h-5 w-20 bg-white/10 rounded mb-2"></div>
        <div className="h-10 bg-white/10 rounded"></div>
      </div>

      {/* Image skeleton */}
      <div>
        <div className="h-5 w-20 bg-white/10 rounded mb-2"></div>
        <div className="h-48 bg-white/10 rounded"></div>
        <div className="h-10 w-full bg-white/10 rounded mt-2"></div>
      </div>

      {/* Content editor skeleton */}
      <div>
        <div className="h-5 w-24 bg-white/10 rounded mb-2"></div>
        <div className="h-64 bg-white/10 rounded"></div>
      </div>

      {/* Category select skeleton */}
      <div>
        <div className="h-5 w-24 bg-white/10 rounded mb-2"></div>
        <div className="h-10 bg-white/10 rounded"></div>
      </div>

      {/* Buttons skeleton */}
      <div className="pt-4 flex gap-4">
        <div className="w-1/2 h-10 bg-white/10 rounded"></div>
        <div className="w-1/2 h-10 bg-white/10 rounded"></div>
      </div>
    </div>
  );
};

const UpdatePost = () => {
  const { id } = useParams();
  const [initialContent, setInitialContent] = useState('');
  const editorRef = useRef<Editor>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewImage, setPreviewImage] = useState('');
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: joiResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      image: '',
      category_id: ''
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        const postResponse = await getPostById(Number(id));
        
        if (postResponse.success && postResponse.post) {
          const post = postResponse.post;
          
          reset({
            title: post.title,
            content: post.content,
            image: post.image,
            category_id: String(post.category_id)
          });

          setPreviewImage(post.image);
          setInitialContent(post.content || '');
          
          if (editorRef.current) {
            editorRef.current.setContent(post.content || '');
          }
        }

        // Fetch categories
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
        
        await fetchCategories();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    const currentContent = editorRef.current?.getContent() || '';
    
    if (!currentContent) {
      toast.error('Content is required');
      return;
    }

    try {
      setIsLoading(true);
      const loadingToast = toast.loading('Updating post...');

      const postData = {
        title: data.title,
        content: currentContent,
        category_id: Number(data.category_id),
        image: watch('image')
      };

      if (fileInputRef.current?.files?.[0]) {
        const formData = new FormData();
        formData.append('image', fileInputRef.current.files[0]);
        try {
          const imageResponse = await axiosClient.post('/upload', formData);
          postData.image = imageResponse.data.url;
        } catch (error) {
          console.error('Image upload error:', error);
          toast.error('Error uploading image');
          return;
        }
      }

      const response = await axiosClient.put(`/posts/${id}`, postData);
      
      if (response.data.success) {
        // Cập nhật lại dữ liệu ngay sau khi update thành công
        const updatedPost = await getPostById(Number(id));
        if (updatedPost.success && updatedPost.post) {
          reset({
            title: updatedPost.post.title,
            content: updatedPost.post.content,
            image: updatedPost.post.image,
            category_id: String(updatedPost.post.category_id)
          });

          setInitialContent(updatedPost.post.content || '');
          if (editorRef.current) {
            editorRef.current.setContent(updatedPost.post.content || '');
          }
        }

        toast.dismiss(loadingToast);
        toast.success('Post updated successfully');
      }
    } catch (error: any) {
      console.error('Update post error:', error);
      toast.dismiss();
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred while updating the post');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  return (
    <>
      <PageTitle title="Update Post | Goshoes" />
      <div className="max-w-5xl mx-auto p-4">
        {isPageLoading ? (
          <FormSkeleton />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">Title</label>
              <input
                type="text"
                {...register('title')}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white disabled:opacity-50"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Image</label>
              <div className="mt-1 space-y-2">
                {previewImage && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  disabled={isLoading}
                  className="mt-1 block w-full text-gray-400 disabled:opacity-50"
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Content</label>
              <div className="mt-1">
                <RichTextEditor
                  ref={editorRef}
                  initialValue={initialContent}
                  onChange={(newContent) => {
                    setValue('content', newContent);
                  }}
                  height={1000}
                  key={`editor-${id}`}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">Category</label>
              <select
                {...register("category_id")}
                disabled={isLoading}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                value={watch('category_id')}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option 
                    key={category.id} 
                    value={category.id}
                  >
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

            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin/post')}
                className="w-1/2 px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-1/2 px-4 py-2 text-white rounded ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isLoading ? 'Processing...' : 'Update Post'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default UpdatePost;
