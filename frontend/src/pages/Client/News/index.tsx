import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getAllNews } from "../../../services/client/news";
import { News } from "../../../types/client/news";
import parse from 'html-react-parser';
import Breadcrumb from "../../../components/client/Breadcrumb";

// Thêm hàm helper để lọc nội dung text
const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const { data, isLoading } = useQuery({
    queryKey: ["NEWS", currentPage],
    queryFn: () => getAllNews(currentPage),
    initialData: {
      success: true,
      message: '',
      data: {
        posts: [],
        pagination: {
          currentPage: 1,
          perPage: postsPerPage,
          totalItems: 0,
          totalPages: 1
        }
      }
    }
  });

  // Sắp xếp tin tức mới nhất lên đầu
  const sortedNews = useMemo(() => {
    if (!data?.data?.posts) return [];
    return [...data.data.posts].sort((a, b) => {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
  }, [data?.data?.posts]);

  // Lọc tin tức dựa trên tìm kiếm và danh mục
  const filteredNews = sortedNews.filter((article: News) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stripHtml(article.content).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "" || article.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Lấy danh sách unique categories
  const categories = Array.from(new Set(sortedNews.map((article: News) => article.category_name)));

  // Render phân trang
  const renderPagination = () => {
    const { currentPage, totalPages } = data.data.pagination;
    const pages = [];

    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        Previous
      </button>
    );

    for (let i = 1;i <= totalPages;i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-4 py-2 text-sm font-medium ${currentPage === i
              ? 'text-white bg-indigo-500 border border-indigo-500'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            } rounded-md`}
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
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        Next
      </button>
    );

    return pages;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <section className="text-gray-700 body-font">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-wrap w-full mb-6">
              <div className="w-full">
                <h1 className="text-4xl font-bold title-font text-gray-900 mb-4">
                  Tin tức
                </h1>
                <div className="h-1 w-24 bg-indigo-500 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Skeleton Loader for News Articles */}
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden animate-pulse"
                >
                  <div className="h-56 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="w-24 h-8 bg-indigo-500 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (sortedNews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-700 text-lg font-medium">
          No news articles available.
        </p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Trang chủ", link: "" },
          { name: "Tin tức", link: "news" },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <section className="text-gray-700 body-font">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-wrap w-full mb-6">
              <div className="w-full">
                <h1 className="text-4xl font-bold title-font text-gray-900 mb-4">
                  Tin tức
                </h1>
                <div className="h-1 w-24 bg-indigo-500 rounded"></div>
              </div>
            </div>

            {/* Search and filter section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm tin tức..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* News grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((article: News) => (
                <div
                  key={article.id}
                  className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="h-56 w-full overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="tracking-widest text-indigo-500 text-xs font-medium uppercase">
                      {article.category_name}
                    </h3>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h2>
                    <p className="text-base text-gray-600 leading-relaxed mb-4 line-clamp-1">
                      {stripHtml(article.content)}
                    </p>
                    <div className="mt-auto">
                      <Link
                        to={`/news/${article.id}`}
                        className="text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-sm font-medium rounded shadow-md transition duration-300"
                      >
                        Đọc thêm
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {!isLoading && data.data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {renderPagination()}
              </div>
            )}

            {/* No results message */}
            {filteredNews.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy tin tức phù hợp</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default NewsPage;
