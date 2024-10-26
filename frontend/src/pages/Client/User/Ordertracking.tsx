import { FaCheckCircle } from "react-icons/fa"; // Bạn cần cài đặt react-icons nếu chưa có
import { useState } from "react";

const OrderTracking = () => {
  const [stages, setStages] = useState([
    { name: "Order Placed", completed: false },
    { name: "Shipped", completed: false },
    { name: "Out for Delivery", completed: false },
    { name: "Delivered", completed: false },
  ]);

  const handleStageClick = (index: number) => {
    setStages((prevStages) =>
      prevStages.map((stage, i) => ({
        ...stage,
        completed: i <= index ? true : stage.completed, // Đánh dấu giai đoạn từ đầu đến giai đoạn đã nhấn
      }))
    );
  };

  return (
    <div className="order-tracking w-full p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-center font-bold text-2xl mb-4">Order Tracking</h2>
      <div className="flex justify-between items-start mb-6">
        {stages.map((stage, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              onClick={() => handleStageClick(index)} // Thêm sự kiện nhấn
              className={`flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all duration-300 ${
                stage.completed ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {stage.completed ? (
                <FaCheckCircle className="text-white text-2xl" />
              ) : (
                <span className="text-gray-700 text-lg font-bold">
                  {index + 1}
                </span>
              )}
            </div>
            <h4 className="font-semibold mt-2">{stage.name}</h4>
          </div>
        ))}
      </div>
      <div className="flex justify-between relative">
        {stages.map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-1 ${
              index < stages.length
                ? stages[index].completed
                  ? "bg-green-500"
                  : "bg-gray-300"
                : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderTracking;
