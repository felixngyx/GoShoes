import { useState, useMemo } from "react";
import { MoreHorizontal, Pencil, Trash, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { Posts } from "../../../types/admin/template/post";
import { getAllPosts } from "../../../services/admin/post";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  const { data, isLoading } = useQuery({
    queryKey: ['posts', currentPage],
    queryFn: () => getAllPosts(),
    initialData: {
      posts: [],
      pagination: {
        currentPage: 1,
        perPage: 9,
        totalItems: 0,
        totalPages: 1
      }
    }
  });

  const sortedPosts = useMemo(() => {
    if (!data.posts) return [];
    return [...data.posts].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      }
      return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
    });
  }, [data.posts, sortOrder]);

  const filteredPosts = useMemo(() => {
    if (!sortedPosts) return [];
    return sortedPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedPosts, searchTerm]);

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= data.pagination.totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i 
              ? 'bg-[#3C50E0] text-white' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="p-6 bg-[#1C2434]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Post Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
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
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <button 
            onClick={() => navigate('/admin/post/create')}
            className="bg-[#3C50E0] hover:bg-[#3C50E0]/80 text-white px-4 py-2 rounded-lg transition"
          >
            Create post
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
          filteredPosts.map((post: Posts) => (
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
                      <div>
                        <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400">
                            {post.category_name}
                          </span>
                          <span className="text-sm text-gray-500">
                            by {post.author_name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        <div className="absolute right-0 top-8 pt-2 opacity-0 invisible 
                                      group-hover:opacity-100 group-hover:visible 
                                      transition-all duration-300">
                          <div className="bg-[#1C2434] border border-white/10 rounded-sm shadow-lg py-1 w-48">
                            <button 
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 w-full transition"
                              onClick={() => navigate(`/admin/post/update/${post.id}`)}
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </button>
                            <button 
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 w-full transition"
                              onClick={() => toast.error('Delete post')}
                            >
                              <Trash className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      {new Date(post.published_at).toLocaleDateString('en-US')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {!isLoading && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50"
          >
            Previous
          </button>
          {renderPagination()}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.pagination.totalPages))}
            disabled={currentPage === data.pagination.totalPages}
            className="px-3 py-1 rounded-md bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Post;
