import { useState, useMemo } from "react";
import { MoreHorizontal, Pencil, Trash, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Posts } from "../../../types/admin/template/post";
import { getAllPosts, deletePost } from "../../../services/admin/post";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const PostSkeleton = () => (
  <div className="bg-white/5 backdrop-blur-sm rounded-sm border border-white/10 shadow-md">
    <div className="p-4">
      <div className="flex items-start gap-4">
        <div className="w-32 h-32 bg-white/10 rounded-sm animate-pulse" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="h-7 bg-white/10 rounded-sm w-3/4 mb-2 animate-pulse" />
              <div className="h-5 bg-white/10 rounded-sm w-1/4 animate-pulse" />
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-white/10 rounded-sm w-full animate-pulse" />
            <div className="h-4 bg-white/10 rounded-sm w-4/5 animate-pulse" />
          </div>
          <div className="mt-4 h-4 bg-white/10 rounded-sm w-24 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const Post = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch tất cả posts
  const { data: allPostsData, isLoading } = useQuery({
    queryKey: ['all-posts'],
    queryFn: async () => {
      const allPosts = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getAllPosts(page);
        allPosts.push(...response.data.posts);
        hasMore = page < response.data.pagination.totalPages;
        page++;
      }

      return {
        success: true,
        message: '',
        data: {
          posts: allPosts,
          pagination: {
            currentPage: 1,
            perPage: 9,
            totalItems: allPosts.length,
            totalPages: Math.ceil(allPosts.length / 9)
          }
        }
      };
    }
  });

  // Sắp xếp posts
  const sortedPosts = useMemo(() => {
    if (!allPostsData?.data?.posts) return [];
    return [...allPostsData.data.posts].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [allPostsData?.data?.posts, sortOrder]);

  // Lọc posts theo search term
  const filteredPosts = useMemo(() => {
    if (!sortedPosts) return [];
    return sortedPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedPosts, searchTerm]);

  // Phân trang cho kết quả đã lọc
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * 9;
    const endIndex = startIndex + 9;
    return filteredPosts.slice(startIndex, endIndex);
  }, [filteredPosts, currentPage]);

  // Tính toán lại số trang dựa trên kết quả lọc
  const totalPages = Math.ceil(filteredPosts.length / 9);

  // Cập nhật lại renderPagination để sử dụng totalPages mới
  const renderPagination = () => {
    const pages = [];

    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50"
      >
        Previous
      </button>
    );

    for (let i = 1;i <= totalPages;i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md ${currentPage === i
            ? 'bg-[#3C50E0] text-white'
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
        >
          {i}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50"
      >
        Next
      </button>
    );

    return pages;
  };

  const handleDelete = async (postId: number) => {
    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'bg-white shadow rounded-lg p-4 max-w-[500px]',
        title: 'text-base font-bold text-gray-800',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton:
          'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2',
        cancelButton:
          'bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400',
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsDeleting(true);
          setSelectedPostId(postId);
          const loadingToast = toast.loading('Deleting post...');

          await deletePost(postId);

          // Invalidate and refetch
          await queryClient.invalidateQueries(['posts']);

          toast.dismiss(loadingToast);
          toast.success('Post deleted successfully');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Error deleting post');
        } finally {
          setIsDeleting(false);
          setSelectedPostId(null);
        }
      }
    })
  };

  return (
    <div className="p-6 bg-[#1C2434]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý bài viết</h1>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 text-gray-400 px-4 py-2 rounded-lg pl-10 w-64"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <select
            className="bg-white/5 text-gray-400 px-4 py-2 rounded-lg"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
          <button
            onClick={() => navigate('/admin/post/create')}
            className="bg-[#3C50E0] hover:bg-[#3C50E0]/80 text-white px-4 py-2 rounded-lg transition"
          >
            Tạo bài viết
          </button>
        </div>
      </div>

      <motion.div
        className="grid gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {isLoading ? (
          // Skeleton loading
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (
          // Actual posts
          paginatedPosts.map((post: Posts) => (
            <div key={post.id} className="bg-white/5 backdrop-blur-sm rounded-sm border border-white/10 shadow-md">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {post.image && (
                    <div className="w-32 h-32 bg-white/10 rounded-sm overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                        <p className="text-sm text-gray-400">{post.category_name}</p>
                      </div>
                      <div className="relative group">
                        <button className="p-2 hover:bg-white/10 rounded-full">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-[#1C2434] border border-white/10 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <button
                            onClick={() => navigate(`/admin/post/update/${post.id}`)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 w-full text-left"
                          >
                            <Pencil className="w-4 h-4" />
                            <span>Chỉnh sửa</span>
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={isDeleting && selectedPostId === post.id}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 w-full text-left text-red-500 disabled:opacity-50"
                          >
                            <Trash className="w-4 h-4" />
                            <span>{isDeleting && selectedPostId === post.id ? 'Đang xóa...' : 'Xóa'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      <div dangerouslySetInnerHTML={{
                        __html: post.content.length > 150
                          ? post.content.substring(0, 150) + '...'
                          : post.content
                      }} />
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Tạo ngày: {new Date(post.created_at).toLocaleDateString()}
                      {post.published_at && ` | Xuất bản: ${new Date(post.published_at).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default Post;
