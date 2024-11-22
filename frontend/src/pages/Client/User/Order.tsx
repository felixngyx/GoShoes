import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { Order, OrderStatus, Tab } from "../../../types/client/order";
import { Search } from "lucide-react";
import {
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Skeleton,
  Box,
  Pagination,
  Select,
  MenuItem,
  InputAdornment,
  Modal,
  Typography,
  IconButton,
} from "@mui/material";
import { Tab as MuiTab, Tabs } from "@mui/material";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Upload, X } from "lucide-react";
import DialogReview from "../../../components/client/DialogReview";

const tabs: Tab[] = [
  { id: "all", label: "ALL", color: "text-red-500" },
  { id: "pending", label: "Pending", color: "text-gray-700" },
  { id: "processing", label: "Processing", color: "text-gray-700" },
  { id: "shipping", label: "Shipping", color: "text-gray-700" },
  { id: "completed", label: "Completed", color: "text-gray-700" },
  { id: "cancelled", label: "Cancelled", color: "text-gray-700" },
  { id: "refunded", label: "Refunded", color: "text-gray-700" },
  { id: "expired", label: "Expired", color: "text-gray-700" },
  { id: "failed", label: "Failed", color: "text-gray-700" },
];

interface ApiResponse {
  success: boolean;
  data: Order[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
}

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface SortOption {
  value: string;
  label: string;
}

interface FilterState {
  search: string;
  status: OrderStatus | "all";
  sort: string;
}

interface RefundFormData {
  reason: string;
  images: File[];
}

export default function OrderList(): JSX.Element {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    sort: "newest",
  });
  const [debouncedFilters] = useDebounce(filters, 500);
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState<{
    type: string;
    orderId: string | null;
    paymentUrl?: string;
  }>({
    type: "",
    orderId: null,
  });
  const [isRenewing, setIsRenewing] = useState<string | null>(null);
  const [refundForm, setRefundForm] = useState<{
    reason: string;
    images: File[];
  }>({
    reason: "",
    images: [],
  });

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["orders", debouncedFilters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        sort: debouncedFilters.sort,
      });

      if (debouncedFilters.status !== "all") {
        params.append("status", debouncedFilters.status);
      }

      if (debouncedFilters.search) {
        params.append("search", debouncedFilters.search);
      }

      const response = await api.get<ApiResponse>(
        `/orders?${params.toString()}`
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch orders");
      }

      return response.data;
    },
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search") as string;

    setFilters((prev) => ({
      ...prev,
      search: searchValue,
    }));
    setPage(1);
  };

  const handleStatusChange = (newStatus: OrderStatus | "all") => {
    setFilters((prev) => ({
      ...prev,
      status: newStatus,
    }));
    setPage(1);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      sort: event.target.value,
    }));
    setPage(1);
  };

  const handleCancelOrder = async (orderId: string): Promise<void> => {
    try {
      await api.put(`/orders/${orderId}/update`, {
        status: "cancelled",
      });

      setOpenDialog({ type: "", orderId: null });
      // Refresh data
      refetch();
      toast.success("Order cancelled successfully");
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to cancel order");
      }
    }
  };

  const handleRefundRequest = async (orderId: string): Promise<void> => {
    try {
      // Upload ảnh lên Cloudinary trước
      const uploadedImages = await Promise.all(
        refundForm.images.map(async (image) => {
          const imageFormData = new FormData();
          imageFormData.append("file", image);
          imageFormData.append("upload_preset", "go_shoes");
          imageFormData.append("cloud_name", "drxguvfuq");

          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/drxguvfuq/image/upload`,
            imageFormData
          );

          return response.data.url;
        })
      );

      // Gửi request với cookie trong header
      const token = Cookies.get("access_token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/refunds`,
        {
          order_id: orderId,
          reason: refundForm.reason,
          images: uploadedImages,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      setOpenDialog({ type: "", orderId: null });
      setRefundForm({ reason: "", images: [] });
      refetch();
      toast.success("Return & refund request submitted successfully");
    } catch (error: any) {
      console.error("Refund request error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to submit return & refund request");
      }
    }
  };

  const handleConfirmReceived = async (orderId: string): Promise<void> => {
    try {
      await api.put(`/orders/${orderId}/update`, {
        status: "completed",
      });

      setOpenDialog({ type: "", orderId: null });
      // Refresh data
      refetch();
      toast.success("Order confirmed as received");
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to confirm order");
      }
    }
  };

  const navigate = useNavigate();

  const handleBuyAgain = async (order: Order) => {
    try {
      if (!order.items || order.items.length === 0) {
        throw new Error("No items in order");
      }

      const itemsWithCurrentPrice = await Promise.all(
        order.items.map(async (item) => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL}/products/${item.product.id}`,
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("access_token")}`,
                },
              }
            );

            const currentProduct = response.data.Data.product;

            if (!currentProduct) {
              throw new Error(`Product ${item.product.name} no longer exists`);
            }

            if (currentProduct.status !== "public") {
              throw new Error(`Product ${item.product.name} is currently unavailable`);
            }

            let currentPrice = currentProduct.promotional_price || currentProduct.price;

            if (item.variant) {
              if (!currentProduct.variants || currentProduct.variants.length === 0) {
                throw new Error(
                  `Product ${item.product.name} has no variants available`
                );
              }

              const currentVariant = currentProduct.variants.find(
                (v) => 
                  v.variant_id === item.variant.id
              );

              if (!currentVariant) {
                throw new Error(
                  `Variant of product ${item.product.name} no longer exists`
                );
              }

              if (currentVariant.quantity === 0) {
                throw new Error(
                  `Variant of product ${item.product.name} is out of stock`
                );
              }

              if (currentVariant.quantity < item.quantity) {
                throw new Error(
                  `Only ${currentVariant.quantity} items left for variant of ${item.product.name}`
                );
              }

              return {
                id: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                thumbnail: currentProduct.thumbnail,
                price: Number(currentPrice),
                total: Number(currentPrice) * item.quantity,
                stock_quantity: currentVariant.quantity,
                product_variant: {
                  variant_id: currentVariant.variant_id,
                  size_id: currentVariant.size_id,
                  color_id: currentVariant.color_id,
                },
              };
            } else {
              if (currentProduct.stock_quantity === 0) {
                throw new Error(`Product ${item.product.name} is out of stock`);
              }

              if (currentProduct.stock_quantity < item.quantity) {
                throw new Error(
                  `Only ${currentProduct.stock_quantity} items left for ${item.product.name}`
                );
              }

              return {
                id: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                thumbnail: currentProduct.thumbnail,
                price: Number(currentPrice),
                total: Number(currentPrice) * item.quantity,
                stock_quantity: currentProduct.stock_quantity,
              };
            }
          } catch (error: any) {
            throw new Error(
              error.message || `Unable to get information for product ${item.product.name}`
            );
          }
        })
      );

      const newTotal = itemsWithCurrentPrice.reduce(
        (sum, item) => sum + item.total,
        0
      );

      const orderSummary = {
        subtotal: newTotal,
        total: newTotal,
        original_total: newTotal,
      };

      navigate("/checkout", {
        state: {
          cartItems: itemsWithCurrentPrice,
          orderSummary: orderSummary,
        },
      });
    } catch (error: any) {
      console.error("Error handling buy again:", error);
      toast.error(error.message || "Unable to process buy again request. Please try again later.");
    }
  };

  const getStatusColor = (
    status: OrderStatus
  ): {
    color:
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning";
  } => {
    const statusColors: Record<
      OrderStatus,
      {
        color:
          | "default"
          | "primary"
          | "secondary"
          | "error"
          | "info"
          | "success"
          | "warning";
      }
    > = {
      pending: { color: "warning" },
      processing: { color: "info" },
      completed: { color: "success" },
      cancelled: { color: "error" },
      refunded: { color: "secondary" },
      expired: { color: "default" },
      shipping: { color: "primary" },
      failed: { color: "error" },
    };
    return statusColors[status];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const renewPaymentLink = async (orderId: string): Promise<void> => {
    try {
      setIsRenewing(orderId);

      const token = Cookies.get("access_token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/renew-payment`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success && response.data.payment_url) {
        setOpenDialog({
          type: "confirm-payment",
          orderId,
          paymentUrl: response.data.payment_url,
        });
      } else {
        throw new Error("Payment URL not found");
      }
    } catch (error: any) {
      console.error("Error renewing payment:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to renew payment link");
      }
    } finally {
      setIsRenewing(null);
    }
  };
  const [openReviewDialog, setOpenReviewDialog] = useState(false);

  const renderActionButtons = (order: Order) => {
    const viewDetailsButton = (
      <Button
        component={Link}
        to={`/account/my-order/${order.id}`}
        variant="outlined"
        size="small"
      >
        View Details
      </Button>
    );

    switch (order.status.toLowerCase()) {
      case "pending":
        return (
          <div className="space-x-2">
            {viewDetailsButton}
            <Button
              variant="contained"
              size="small"
              onClick={() =>
                setOpenDialog({
                  type: "confirm-payment",
                  orderId: order.id,
                  paymentUrl: order.payment?.payment_url,
                })
              }
              color="primary"
            >
              Pay Now
            </Button>
          </div>
        );

      case "expired":
        return (
          <div className="space-x-2">
            {viewDetailsButton}
            <Button
              variant="contained"
              size="small"
              onClick={() => renewPaymentLink(order.id)}
              color="primary"
              disabled={isRenewing === order.id}
            >
              {isRenewing === order.id ? "Renewing..." : "Renew Link"}
            </Button>
          </div>
        );

      case "processing":
        return (
          <div className="space-x-2">
            {viewDetailsButton}
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() =>
                setOpenDialog({ type: "cancel", orderId: order.id })
              }
            >
              Cancel Order
            </Button>
          </div>
        );

      case "completed":
        return (
          <div className="space-x-2">
            {viewDetailsButton}

            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setOpenDialog({ type: "refund", orderId: order.id })
              }
            >
              Return & Refund
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setOpenReviewDialog(true);
                setSelectedOrderId(order.id);
              }}
              color="primary"
            >
              Review
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleBuyAgain(order)}
              color="primary"
            >
              Buy Again
            </Button>

            <DialogReview
              open={openReviewDialog}
              onClose={() => setOpenReviewDialog(false)}
              orderId={selectedOrderId}
            />
          </div>
        );

      case "shipping":
        return (
          <div className="space-x-2">
            {viewDetailsButton}
            <Button
              variant="contained"
              size="small"
              color="success"
              onClick={() =>
                setOpenDialog({ type: "confirm-received", orderId: order.id })
              }
            >
              Confirm Received
            </Button>
          </div>
        );

      default:
        return viewDetailsButton;
    }
  };

  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const sortOptions: SortOption[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];

  const handleClosePaymentDialog = () => {
    setOpenDialog({ type: "", orderId: null });
    // Refresh data after closing dialog
    refetch();
  };

  const handleConfirmPayment = () => {
    if (openDialog.paymentUrl) {
      window.location.href = openDialog.paymentUrl;
    }
    setOpenDialog({ type: "", orderId: null });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // Kiểm tra số lượng ảnh tối đa
    if (refundForm.images.length + fileArray.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate files
    const validFiles = fileArray.filter((file) => {
      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max size is 5MB`);
        return false;
      }

      // Check file type
      if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
        toast.error(`File ${file.name} is not a valid image format (JPG, PNG)`);
        return false;
      }

      return true;
    });

    setRefundForm((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));

    // Reset input
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setRefundForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full sm:w-auto">
          <TextField
            name="search"
            placeholder="Search by Order ID, SKU..."
            variant="outlined"
            size="small"
            defaultValue={filters.search}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="w-5 h-5 text-gray-500" />
                </InputAdornment>
              ),
            }}
            className="w-full sm:w-80"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={filters.sort}
            onChange={handleSortChange}
            size="small"
            className="w-full sm:w-48"
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      <Paper className="mb-4">
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={filters.status}
            onChange={(_, newValue) => handleStatusChange(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab) => (
              <MuiTab
                key={tab.id}
                label={
                  <div className="flex items-center gap-2">
                    {tab.label}
                    {ordersData?.filters?.counts?.[tab.id] && (
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                        {ordersData.filters.counts[tab.id]}
                      </span>
                    )}
                  </div>
                }
                value={tab.id}
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {(filters.search || filters.status !== "all") && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.search && (
            <Chip
              label={`Search: ${filters.search}`}
              onDelete={() => setFilters((prev) => ({ ...prev, search: "" }))}
              size="small"
            />
          )}
          {filters.status !== "all" && (
            <Chip
              label={`Status: ${filters.status}`}
              onDelete={() =>
                setFilters((prev) => ({ ...prev, status: "all" }))
              }
              size="small"
            />
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Paper key={index} className="p-4">
              <Skeleton variant="rectangular" height={100} />
            </Paper>
          ))}
        </div>
      ) : (
        <>
          {ordersData?.data.map((order) => (
            <Paper key={order.id} className="mb-4 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">Order #{order.sku}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <Chip
                  label={order.status}
                  color={getStatusColor(order.status).color}
                  size="small"
                />
              </div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={order.items[0]?.product.thumbnail}
                    alt={order.items[0]?.product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {order.items[0]?.product.name}
                        {order.items.length > 1 && (
                          <span className="text-sm text-gray-500 ml-2">
                            +{order.items.length - 1} orther products
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">SKU: {order.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.total)}</p>
                  {Number(order.original_total) - Number(order.total) > 0 && (
                    <p className="text-sm text-green-600">
                      Saving:{" "}
                      {formatCurrency(
                        Number(order.original_total) - Number(order.total)
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end items-center pt-4 space-x-2">
                {renderActionButtons(order)}
              </div>
            </Paper>
          ))}

          {(!ordersData?.data || ordersData.data.length === 0) && (
            <Paper className="p-12 text-center text-gray-500">
              {filters.search
                ? "No orders found matching your search criteria"
                : "No orders found"}
            </Paper>
          )}

          {ordersData?.pagination && ordersData.data.length > 0 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={ordersData.pagination.last_page}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <Dialog
        open={openDialog.type === "cancel"}
        onClose={() => setOpenDialog({ type: "", orderId: null })}
      >
        <DialogTitle>Confirm Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog({ type: "", orderId: null })}>
            No
          </Button>
          <Button
            onClick={() =>
              openDialog.orderId && handleCancelOrder(openDialog.orderId)
            }
            variant="contained"
            color="error"
          >
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={openDialog.type === "refund"}
        onClose={() => {
          setOpenDialog({ type: "", orderId: null });
          setRefundForm({ reason: "", images: [] });
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 600 },
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" component="h2" mb={2}>
            Return & Refund Request
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Please provide details about your return request. Note that items
            must be in their original condition.
          </Typography>

          <TextField
            fullWidth
            label="Reason for Return"
            multiline
            rows={4}
            value={refundForm.reason}
            onChange={(e) =>
              setRefundForm((prev) => ({ ...prev, reason: e.target.value }))
            }
            placeholder="Please explain why you want to return this item..."
            required
            margin="normal"
          />

          <Box mt={3}>
            <Typography variant="subtitle2" mb={1}>
              Upload Images (Max 5)
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
              }}
            >
              {refundForm.images.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "relative",
                    width: 100,
                    height: 100,
                  }}
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "background.paper",
                      "&:hover": {
                        bgcolor: "background.paper",
                      },
                    }}
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <Button
              variant="outlined"
              onClick={handleUploadClick}
              startIcon={<Upload className="w-4 h-4" />}
              disabled={refundForm.images.length >= 5}
            >
              Upload Images ({refundForm.images.length}/5)
            </Button>
          </Box>

          <DialogActions sx={{ mt: 3 }}>
            <Button
              onClick={() => {
                setOpenDialog({ type: "", orderId: null });
                setRefundForm({ reason: "", images: [] });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                openDialog.orderId && handleRefundRequest(openDialog.orderId)
              }
              variant="contained"
              color="primary"
              disabled={
                !refundForm.reason.trim() || refundForm.images.length === 0
              }
            >
              Submit Request
            </Button>
          </DialogActions>
        </Box>
      </Modal>

      <Dialog
        open={openDialog.type === "confirm-received"}
        onClose={() => setOpenDialog({ type: "", orderId: null })}
      >
        <DialogTitle>Confirm Order Received</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Have you received your order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog({ type: "", orderId: null })}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              openDialog.orderId && handleConfirmReceived(openDialog.orderId)
            }
            variant="contained"
            color="success"
          >
            Yes, I've Received It
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog.type === "confirm-payment"}
        onClose={handleClosePaymentDialog}
      >
        <DialogTitle>Confirm Payment Navigation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to proceed to the payment page now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Later</Button>
          <Button
            onClick={handleConfirmPayment}
            variant="contained"
            color="primary"
          >
            Pay Now
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
