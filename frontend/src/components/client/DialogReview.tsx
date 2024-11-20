import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query"; // Thêm useMutation
import axiosClient from "../../apis/axiosClient";
import { submitReview } from "../../services/client/review";
import toast from "react-hot-toast";
// Đảm bảo đã import đúng dịch vụ

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
  sku: string;
  status: string;
  total: string;
  created_at: string;
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };
  shipping: {
    id: number;
    shipping_detail: {
      name: string;
      address: string;
      phone_number: string;
      address_detail: string;
    };
    is_default: boolean;
  };
  payment: {
    method: string;
    status: string;
    url: string;
  };
  items: OrderItem[];
}

const DialogReview: React.FC<DialogReviewProps> = ({
  open,
  onClose,
  orderId,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [productId, setProductId] = useState<number | null>(null);

  const { data: order } = useQuery<{ data: OrderData }>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      try {
        const response = await axiosClient(`/orders/${orderId}`);
        return response.data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  const orderData = order?.data;
  const product = orderData?.items?.[0]?.product;
  const variant = orderData?.items?.[0]?.variant;

  useEffect(() => {
    if (product) {
      setProductId(product.id);
    }
  }, [product]);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (data: {
      productId: number;
      rating: number;
      comment: string;
    }) => submitReview(data.productId, data.rating, data.comment),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      onClose();
    },
    onError: (error) => {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    },
  });

  const handleSubmit = () => {
    // Kiểm tra xem đã có đánh giá (rating) và bình luận chưa
    if (!rating || !comment.trim()) {
      toast("Please provide both a rating and a comment.");
      return;
    }

    // Kiểm tra xem có productId không
    if (!productId) {
      toast("Product ID is missing. Please try again.");
      console.error("Product ID is missing");
      return;
    }

    // Log thông tin form ra console
    console.log({
      productId: productId,
      rating: rating,
      comment: comment,
    });
  };

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <div className="p-6">
        <DialogTitle className="text-lg font-semibold text-center">
          Review Product
        </DialogTitle>

        <DialogContent>
          {/* Product Information */}
          {product ? (
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <div>
                <h3 className="font-medium text-gray-800">{product.name}</h3>
                {variant && (
                  <>
                    <p className="text-sm text-gray-600">
                      Size:{" "}
                      <span className="font-semibold">{variant.size}</span>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="font-semibold mr-1">Color:</span>
                      <span
                        className="inline-block w-4 h-4 rounded-full"
                        style={{ backgroundColor: variant.color }}
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
            Cancel
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
