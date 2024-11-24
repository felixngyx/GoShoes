import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getAllNews } from "../../../services/client/news";
import { News } from "../../../types/client/news";

const NewsPage = () => {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["NEWS"],
    queryFn: getAllNews,
  });
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <section className="text-gray-700 body-font">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-wrap w-full mb-6">
              <div className="w-full">
                <h1 className="text-4xl font-bold title-font text-gray-900 mb-4">
                  News
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

  if (news.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-700 text-lg font-medium">
          No news articles available.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-gray-700 body-font">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-wrap w-full mb-6">
            <div className="w-full">
              <h1 className="text-4xl font-bold title-font text-gray-900 mb-4">
                News
              </h1>
              <div className="h-1 w-24 bg-indigo-500 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article: News) => (
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
                  <p className="text-base text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {article.content}
                  </p>
                  <div className="mt-auto">
                    <Link
                      to={`/news/${article.id}`}
                      className="text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-sm font-medium rounded shadow-md transition duration-300"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
