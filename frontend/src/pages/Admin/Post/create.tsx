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

const FormSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Title skeleton */}
            <div>
                <div className="h-5 w-20 bg-white/10 rounded mb-2"></div>
                <div className="h-10 bg-white/10 rounded"></div>
            </div>

            {/* Image skeleton */}
            <div>
                <div className="h-5 w-20 bg-white/10 rounded mb-2"></div>
                <div className="h-48 bg-white/10 rounded"></div>
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

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isPageLoading, setIsPageLoading] = useState(true);
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
                setIsPageLoading(true);
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
            } finally {
                setIsPageLoading(false);
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
            toast.success("Thumbnail image uploaded successfully!");
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("Error uploading image!");
        }
    };

    const onSubmit = async (data: FormData) => {
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
                category_id: Number(data.category_id),
                image: data.image,
                scheduled_at: data.scheduled_at && data.scheduled_at !== '' ? data.scheduled_at : null,
                status: data.scheduled_at && data.scheduled_at !== '' ? 'scheduled' : 'published'
            };

            const response = await axiosClient.post('/posts', postData);
            
            if (response.data.success) {
                toast.dismiss(loadingToast);
                toast.success('Create post successfully!');
                navigate('/admin/post');
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Create New Post</h1>
                    <button
                        onClick={() => navigate('/admin/post')}
                        className="px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded"
                    >
                        Back
                    </button>
                </div>
                
                {isPageLoading ? (
                    <FormSkeleton />
                ) : (
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
                            <label className="block mb-2 font-medium">Thumbnail Image</label>
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
                                Upload Thumbnail Image
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
                            <label className="block mb-2 font-medium">Schedule Post (Optional)</label>
                            <input
                                type="datetime-local"
                                {...register('scheduled_at')}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                defaultValue=""
                            />
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
                                        : 'bg-green-500 hover:bg-green-600'
                                }`}
                            >
                                {isLoading ? 'Processing...' : 'Create Post'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
};

export default CreatePost;