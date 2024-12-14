import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import OrderTracking from "./Ordertracking";
import {
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import { MdCalendarToday } from "react-icons/md";
import { CalendarClock, Mail, MapPin, Phone } from "lucide-react";

interface OrderItem {
  quantity: number;
  price: string;
  subtotal: number;
  product: {
    name: string;
    thumbnail: string;
  };
  variant?: {
    size: string;
    color: string;
  } | null;
}

interface ShippingDetail {
  name: string;
  phone_number: string;
  address: string;
  address_detail: string;
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
    shipping_detail: string;
    is_default: boolean;
  };
  payment: {
    method: string;
    status: string;
    url: string;
  };
  items: OrderItem[];
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<{ success: boolean; data: OrderData }>({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
          },
        }
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order?.success) {
    return <Alert severity="error">Failed to load order details</Alert>;
  }

  const orderData = order.data;
  const shippingDetail: ShippingDetail = orderData.shipping?.shipping_detail || {
    name: orderData.customer?.name || '',
    phone_number: orderData.customer?.phone || '',
    address: '',
    address_detail: ''
  };

  console.log('Shipping Detail:', shippingDetail);

  return (
    <Box className="container mx-auto py-8 px-4">
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                Đơn hàng #{orderData.sku}
              </Typography>
              <Box display="flex" alignItems="center">
                <CalendarClock size={16} style={{ marginRight: "8px" }} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(orderData.created_at).toLocaleDateString("vi-VN")}
                </Typography>
              </Box>
            </Box>

          </Box>
          <OrderTracking
            status={orderData.status}
            paymentStatus={orderData.payment.status}
            paymentMethod={orderData.payment.method}
          />
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sản phẩm trong đơn hàng
              </Typography>
              <Box sx={{ maxHeight: 400, overflowY: "auto", pr: 2 }}>
                {orderData.items.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      mb: 3,
                      pb: 3,
                      borderBottom:
                        index !== orderData.items.length - 1
                          ? "1px solid #e0e0e0"
                          : "none",
                    }}
                  >
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: "hidden",
                        mr: 2,
                      }}
                    >
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" noWrap>
                        {item.product.name}
                      </Typography>
                      {item.variant && (
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            Kích thước: {item.variant.size}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Màu sắc: {item.variant.color}
                          </Typography>
                        </Box>
                      )}
                      <Box
                        mt={1}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Số lượng: {item.quantity}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.subtotal)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tóm tắt đơn hàng
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1">Tổng cộng</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(orderData.total))}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin khách hàng
              </Typography>
              <Box mb={2}>
                <Typography variant="subtitle1">
                  {shippingDetail.name}
                </Typography>
                <Box display="flex" alignItems="center">
                  <Mail size={16} style={{ marginRight: "8px" }} />
                  <Typography variant="body2" color="text.secondary">
                    {orderData.customer.email}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Box display="flex" alignItems="flex-start" mb={1}>
                  <MapPin
                    size={16}
                    style={{ marginRight: "8px", marginTop: "4px" }}
                  />
                  <Typography variant="body2">
                    {shippingDetail.address_detail &&
                      `${shippingDetail.address_detail}, `}
                    {shippingDetail.address}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Phone size={16} style={{ marginRight: "8px" }} />
                  <Typography variant="body2">
                    {shippingDetail.phone_number}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chi tiết thanh toán
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="body2" color="text.secondary">
                  Phương thức
                </Typography>
                <Typography variant="body1">
                  {orderData.payment.method}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Chip
                  label={
                    orderData.payment.status.charAt(0).toUpperCase() +
                    orderData.payment.status.slice(1)
                  }
                  color={
                    orderData.payment.status === "paid" ? "success" : "default"
                  }
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetail;
