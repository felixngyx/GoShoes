import { Link } from "react-router-dom";

const NotfoundPage = () => {
  return (
    <div className="flex justify-center items-center min-h-[600px]">
      <span className="text-center">
        <h1 className="text-[110px]">404 Không Tìm Thấy</h1>
        <p className="text-[16px] font-extralight">
          Trang bạn truy cập không tìm thấy. Bạn có thể về trang chủ.
        </p>
        <Link to="/" className="btn btn-outline bg-[#4182F9] text-white mt-10">
          Quay lại trang chủ
        </Link>
      </span>
    </div>
  );
};

export default NotfoundPage;
