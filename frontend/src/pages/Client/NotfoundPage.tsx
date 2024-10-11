import { Link } from "react-router-dom";

const NotfoundPage = () => {
  return (
    <div className="flex justify-center items-center min-h-[600px]">
      <span className="text-center">
        <h1 className="text-[110px]">404 Not Found</h1>
        <p className="text-[16px] font-extralight">
          Your visited page not found. You may go home page.
        </p>
        <Link to="/" className="btn btn-outline bg-[#4182F9] text-white mt-10">
          Back to home page
        </Link>
      </span>
    </div>
  );
};

export default NotfoundPage;
