import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Icon mũi tên

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pageNumbers: JSX.Element[] = [];
    const range = 2;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`px-4 py-2 mx-1 rounded-md text-sm ${
              i === currentPage
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500 hover:bg-blue-200"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Hiển thị trang đầu tiên và gần trang hiện tại
      if (currentPage > range + 1) {
        pageNumbers.push(
          <button
            key={1}
            onClick={() => handlePageClick(1)}
            className="px-4 py-2 mx-1 rounded-md text-sm border bg-white text-blue-500"
          >
            1
          </button>
        );
        pageNumbers.push(
          <span key="dots-start" className="text-sm">
            ...
          </span>
        );
      }

      // Các nút trang gần trang hiện tại
      for (
        let i = Math.max(currentPage - range, 2);
        i <= Math.min(currentPage + range, totalPages - 1);
        i++
      ) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`px-4 py-2 mx-1 rounded-md text-sm ${
              i === currentPage
                ? "bg-blue-500 text-white"
                : "bg-white border text-blue-500 hover:bg-blue-200"
            }`}
          >
            {i}
          </button>
        );
      }

      // Hiển thị trang cuối cùng nếu gần trang hiện tại hoặc ở cuối trang
      if (currentPage < totalPages - range) {
        pageNumbers.push(
          <span key="dots-end" className="text-sm">
            ...
          </span>
        );
      }

      // Hiển thị trang cuối
      if (currentPage < totalPages) {
        pageNumbers.push(
          <button
            key={totalPages}
            onClick={() => handlePageClick(totalPages)}
            className="px-4 py-2 mx-1 border rounded-md text-sm bg-white text-blue-500"
          >
            {totalPages}
          </button>
        );
      }
    }
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-5">
      {/* Previous Page Button */}
      <button
        className={`p-2 rounded-md text-white ${
          currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
        }`}
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        <p className="flex justify-center items-center gap-1">
          <FaChevronLeft size={13} />
          Trước
        </p>
      </button>

      {/* Render Page Numbers */}
      {renderPageNumbers()}

      {/* Next Page Button */}
      <button
        className={`p-2 rounded-md text-white ${
          currentPage === totalPages
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500"
        }`}
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <p className="flex justify-center items-center gap-1">
          Sau
          <FaChevronRight size={13} />
        </p>
      </button>
    </div>
  );
};

export default Pagination;
