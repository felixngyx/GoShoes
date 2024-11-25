import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getNewsById } from "../../../services/client/news";
import parse from 'html-react-parser';

const NewsPageDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const { data: newDetail, isLoading } = useQuery({
    queryKey: ["NEWS", id],
    queryFn: () => getNewsById(Number(id)),
    enabled: !!id,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {newDetail.title}
        </h1>
        <div className="mb-6 text-sm text-gray-600">
          <span>
            By <strong>{newDetail.author_name}</strong>
          </span>{" "}
          | <span>{new Date(newDetail.published_at).toLocaleDateString()}</span>
        </div>
        <img
          src={newDetail.image}
          alt={newDetail.title}
          className="w-full h-72 object-cover rounded-lg mb-6"
        />
        <div className="text-lg text-gray-700 leading-relaxed mb-6">
          {parse(newDetail.content)}
        </div>

        {/* Thêm thông tin thêm về bài viết */}
        <div className="flex justify-between items-center border-t pt-4 mt-6">
          <Link
            to="/news"
            className="text-indigo-500 hover:text-indigo-700 text-sm font-medium"
          >
            &larr; Back to News
          </Link>
          <div className="text-sm text-gray-500">
            Category: <strong>{newDetail.category_name}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPageDetail;
