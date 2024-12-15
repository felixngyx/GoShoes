import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../../apis/axiosClient";
import { submitReview } from "../../services/client/review";
import toast from "react-hot-toast";

interface DialogReviewProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
}

interface OrderItem {
  quantity: number;
  price: string;
  subtotal: number;
  product: {
    id: number;
    name: string;
    thumbnail: string;
  };
  variant?: {
    size: string;
    color: string;
  } | null;
}

interface OrderData {
  id: number;
  items: OrderItem[];
}

const DialogReview: React.FC<DialogReviewProps> = ({
  open,
  onClose,
  orderId,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [currentReviewIndex, setCurrentReviewIndex] = useState<number>(0);

  const { data: order } = useQuery<{ data: OrderData }>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await axiosClient(`/orders/${orderId}`);
      return response.data;
    },
  });

  const orderData = order?.data;
  const items = orderData?.items || [];
  const currentProduct = items[currentReviewIndex]?.product;
  const currentVariant = items[currentReviewIndex]?.variant;

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (data: {
      productId: number;
      rating: number;
      comment: string;
    }) => submitReview(data.productId, data.rating, data.comment),
    onSuccess: () => {
      toast.success("Sản phẩm đã được đánh giá thành công.");
      if (currentReviewIndex < items.length - 1) {
        // Chuyển sang sản phẩm tiếp theo
        setRating(null); // Reset rating
        setComment(""); // Reset comment
        setCurrentReviewIndex((prevIndex) => prevIndex + 1);
      } else {
        // Đã đánh giá hết
        toast.success("Bạn đã đánh giá tất cả sản phẩm trong đơn hàng.");
        onClose();
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi đánh giá sản phẩm. Vui lòng thử lại.");
    },
  });

  const handleSubmit = () => {
    if (!rating || !comment.trim()) {
      toast("Vui lòng nhập đầy đủ thông tin đánh giá.");
      return;
    }

    if (!currentProduct) {
      toast("Không tìm thấy thông tin sản phẩm.");
      return;
    }

    mutateAsync({
      productId: currentProduct.id,
      rating: rating,
      comment: comment,
    });
  };

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <div className="p-6">
        <DialogTitle className="text-lg font-semibold text-center">
          Review Product {currentReviewIndex + 1}/{items.length}
        </DialogTitle>

        <DialogContent>
          {/* Product Information */}
          {currentProduct ? (
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={currentProduct.thumbnail}
                alt={currentProduct.name}
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <div>
                <h3 className="font-medium text-gray-800">
                  {currentProduct.name}
                </h3>
                {currentVariant && (
                  <>
                    <p className="text-sm text-gray-600">
                      Size:{" "}
                      <span className="font-semibold">
                        {currentVariant.size}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="font-semibold mr-1">Color:</span>
                      <span
                        className="inline-block w-4 h-4 rounded-full border-2"
                        style={{ backgroundColor: currentVariant.color }}
                      ></span>
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p>Loading product information...</p>
          )}

          {/* Rating and Comment */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Rating
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                size="large"
              />
            </div>
            <TextField
              label="Write your comment"
              multiline
              rows={4}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
            />
          </div>
        </DialogContent>
        <DialogActions className="mt-4 flex justify-between">
          <Button onClick={onClose} className="text-gray-500">
            Huỷ
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isLoading || !rating || !comment.trim()}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default DialogReview;
