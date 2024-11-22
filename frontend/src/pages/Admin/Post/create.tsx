import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosClient from '../../../apis/axiosClient';
import RichTextEditor from '../../../components/admin/RichTextEditor';
import PageTitle from '../../../components/admin/PageTitle';

interface FormData {
    title: string;
    content: string;
    image: string;
    category_id: string;
    slug: string;
    scheduled_at: string;
    published_at: string;
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

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosClient.get<CategoryResponse>('/post-categories');
                if (response.data.success) {
                    setCategories(response.data.data.categories);
                } else {
                    toast.error('Không thể tải danh sách danh mục');
                }
            } catch (error) {
                console.error('Categories error:', error);
                toast.error('Không thể tải danh sách danh mục');
                setCategories([]);
            }
        };
        
        fetchCategories();
    }, []);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    // Handle image upload through Cloudinary
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
                toast.error('Không thể tải ảnh lên');
            }
        });
    };

    // Handle featured image upload
    const handleFeaturedImageUpload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    // Handle file change
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
            toast.success("Tải ảnh đại diện thành công!");
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("Có lỗi xảy ra khi tải ảnh!");
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!content) return;

        try {
            setIsLoading(true);
            const postData = {
                ...data,
                content,
                slug: generateSlug(data.title)
            };

            const response = await axiosClient.post('/posts', postData);
            toast.success('Tạo bài viết thành công!');
            // Redirect to post list or post detail
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo bài viết');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PageTitle title="Create Post | Goshoes" />
            <div className="max-w-5xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Tạo bài viết mới</h1>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block mb-2 font-medium">Tiêu đề</label>
                        <input
                            type="text"
                            {...register("title", { required: "Vui lòng nhập tiêu đề" })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập tiêu đề bài viết"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Ảnh đại diện</label>
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
                            Tải ảnh đại diện
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
                        <label className="block mb-2 font-medium">Nội dung</label>
                        <RichTextEditor
                            initialValue=""
                            onChange={setContent}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Danh mục</label>
                        <select
                            {...register("category_id", { required: "Vui lòng chọn danh mục" })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Chọn danh mục</option>
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
                        <label className="block mb-2 font-medium">Thời gian xuất bản</label>
                        <input
                            type="datetime-local"
                            {...register("published_at")}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
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
                            {isLoading ? 'Đang xử lý...' : 'Tạo bài viết'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreatePost;