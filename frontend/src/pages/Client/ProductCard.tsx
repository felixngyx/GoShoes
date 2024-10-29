import { useQuery } from "@tanstack/react-query";
import { IoCart, IoHeartOutline, IoStar } from "react-icons/io5";
import { Link } from "react-router-dom";
import { getAllProducts } from "../../services/client/products";
import { IProduct } from "../../types/client/products/products";

const ProductCard = () => {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["PRODUCT_KEY"],
    queryFn: () => getAllProducts(1, 6),
  });

  console.log("Products data:", products);

  if (isLoading) {
    return <p>Loading....</p>;
  }
  if (isError) {
    return <p>Error.......</p>;
  }

  if (!Array.isArray(products)) {
    return <p>No products found.</p>; // Xử lý khi không phải là mảng
  }
  return (
    <div>
      {products?.map((product: IProduct) => (
        <div
          key={product.id}
          className="col-span-1 border border-gray-[#F6F7F8] rounded-lg group overflow-hidden"
        >
          <div className="relative">
            <img src={product.thumbnail} alt={product.name} />
            <div className="absolute hidden group-hover:flex w-[90%] h-[90%] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white justify-center items-center gap-2 z-1">
              <IoHeartOutline
                className="cursor-pointer"
                size={30}
                color="#40BFFF"
              />
              <IoCart className="cursor-pointer" size={30} color="#40BFFF" />
            </div>
            <div className="absolute top-0 left-0 text-white font-semibold bg-red-500 px-2 ">
              HOT
            </div>
          </div>
          <Link to={`/products/${product.id}`}>
            <p className="text-center text-[#223263] text-xl font-bold mt-2">
              {product.name}
            </p>
          </Link>
          <div className="flex flex-row items-center justify-center gap-1 mx-auto my-1">
            <IoStar color="yellow" />
            <IoStar color="yellow" />
            <IoStar color="yellow" />
            <IoStar color="yellow" />
            <IoStar color="yellow" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-primary text-lg font-bold">
              {product.promotional_price}
            </p>
            <p className="text-[#9098B1] text-xm font-bold line-through">
              {product.price}
            </p>
            <p className="text-[#E71D36] text-xm font-bold">-10%</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCard;
