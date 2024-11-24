import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosClient from '../../../apis/axiosClient';
import RichTextEditor from '../../../components/admin/RichTextEditor';
import PageTitle from '../../../components/admin/PageTitle';
import { useNavigate } from 'react-router-dom';
import * as Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';

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
    title: Joi.string().required().max(255).messages({
        'string.empty': 'Title is required',
        'string.max': 'Title cannot exceed 255 characters',
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
    scheduled_at: Joi.string().allow(null),
    published_at: Joi.string().allow(null),
    status: Joi.string().valid('draft', 'published', 'scheduled').required()
});

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
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
    }, []);

    const generateSlug = (title: string) => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const baseSlug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        
        return `${baseSlug}-${timestamp}-${randomString}`;
    };

    const handleEditorImageUpload = async (blobInfo: any): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            const formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );
                
                const data = await response.json();
                resolve(data.secure_url);
            } catch (error) {
                reject('Image upload failed');
                toast.error('Failed to upload image');
            }
        });
    };

    const handleFeaturedImageUpload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );
            
            const data = await response.json();
            setValue("image", data.secure_url);
            toast.success("Featured image uploaded successfully!");
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("Error uploading image!");
        }
    };

    const onSubmit = async (data: FormData) => {
        console.log('Form data:', data);
        console.log('Content:', content);
        
        if (!content) {
            toast.error('Content is required');
            return;
        }

        try {
            setIsLoading(true);
            const loadingToast = toast.loading('Creating post...');

            const postData = {
                title: data.title,
                content: content,
                image: data.image,
                category_id: Number(data.category_id),
                scheduled_at: data.status === 'scheduled' ? data.published_at : null,
                published_at: data.status === 'published' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
                status: data.status
            };

            const response = await axiosClient.post('/posts', postData);
            
            if (response.data.success) {
                toast.dismiss(loadingToast);
                toast.success('Post created successfully');
                navigate('/admin/posts');
            }
        } catch (error: any) {
            console.error('Create post error:', error);
            toast.error(error.response?.data?.message || 'Error creating post');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PageTitle title="Create Post | Goshoes" />
            <div className="max-w-5xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
                
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(onSubmit)(e);
                }} className="space-y-6">
                    <div>
                        <label className="block mb-2 font-medium">Title</label>
                        <input
                            type="text"
                            {...register("title", { required: "Title is required" })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter post title"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Featured Image</label>
                        <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={handleFeaturedImageUpload}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Upload Featured Image
                        </button>
                        {watch("image") && (
                            <div className="mt-2">
                                <img 
                                    src={watch("image")} 
                                    alt="Featured" 
                                    className="w-40 h-40 object-cover rounded"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Content</label>
                        <RichTextEditor
                            initialValue=""
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
                        <label className="block mb-2 font-medium">Publish Date</label>
                        <input
                            type="datetime-local"
                            {...register("published_at")}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Status</label>
                        <select
                            {...register("status", { required: "Status is required" })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                        {errors.status && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.status.message}
                            </p>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full px-4 py-2 text-white rounded ${
                                isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-500 hover:bg-green-600'
                            }`}
                        >
                            {isLoading ? 'Processing...' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreatePost;