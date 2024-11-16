import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { Order, OrderStatus, Tab } from '../../../types/client/order';
import { Search } from 'lucide-react';
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
  Pagination
} from '@mui/material';
import { Tab as MuiTab, Tabs } from '@mui/material';

const tabs: Tab[] = [
  { id: 'all', label: 'ALL', color: 'text-red-500' },
  { id: 'pending', label: 'Pending', color: 'text-gray-700' },
  { id: 'processing', label: 'Processing', color: 'text-gray-700' },
  { id: 'shipping', label: 'Shipping', color: 'text-gray-700' },
  { id: 'completed', label: 'Completed', color: 'text-gray-700' },
  { id: 'cancelled', label: 'Cancelled', color: 'text-gray-700' },
  { id: 'refunded', label: 'Refunded', color: 'text-gray-700' },
  { id: 'expired', label: 'Expired', color: 'text-gray-700' },
  { id: 'failed', label: 'Failed', color: 'text-gray-700' }
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
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function OrderList(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState<{ type: string; orderId: string | null }>({ type: '', orderId: null });

  const { data: ordersData, isLoading } = useQuery<ApiResponse>({
    queryKey: ['orders', activeTab, searchTerm, page],
    queryFn: async () => {
      let url = '/orders?';
      const params = new URLSearchParams({
        page: page.toString()
      });

      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get<ApiResponse>(`${url}${params.toString()}`);
      
      if (!response.data.success) {
        throw new Error('Failed to fetch orders');
      }

      return response.data;
    },
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get('search') as string;
    setSearchTerm(searchValue);
    setPage(1);
  };

  const handleCancelOrder = async (orderId: string): Promise<void> => {
    try {
      await api.post(`/orders/${orderId}/cancel`);
      setOpenDialog({ type: '', orderId: null });
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleRefundRequest = async (orderId: string): Promise<void> => {
    try {
      await api.post(`/orders/${orderId}/refund-request`);
      setOpenDialog({ type: '', orderId: null });
    } catch (error) {
      console.error('Error requesting refund:', error);
    }
  };

  const handleConfirmReceived = async (orderId: string): Promise<void> => {
    try {
      await api.post(`/orders/${orderId}/confirm-received`);
      setOpenDialog({ type: '', orderId: null });
    } catch (error) {
      console.error('Error confirming order received:', error);
    }
  };

  const getStatusColor = (status: OrderStatus): { color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" } => {
    const statusColors: Record<OrderStatus, { color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }> = {
      pending: { color: 'warning' },
      processing: { color: 'info' },
      completed: { color: 'success' },
      cancelled: { color: 'error' },
      refunded: { color: 'secondary' },
      expired: { color: 'default' },
      shipping: { color: 'primary' },
      failed: { color: 'error' }
    };
    return statusColors[status];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const renderActionButtons = (order: Order): JSX.Element | null => {
    switch (order.status) {
      case 'shipping':
        return (
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={() => setOpenDialog({ type: 'confirm-received', orderId: order.id })}
          >
            Confirm Received
          </Button>
        );
      case 'completed':
        return (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setOpenDialog({ type: 'refund', orderId: order.id })}
          >
            Request Refund
          </Button>
        );
      case 'processing':
        return (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setOpenDialog({ type: 'cancel', orderId: order.id })}
          >
            Cancel Order
          </Button>
        );
      case 'expired':
        return (
          <Button
            variant="contained"
            size="small"
            component={Link}
            to={`/products/${order.items[0]?.product.id}`}
            color="primary"
          >
            Buy Again
          </Button>
        );
      default:
        return null;
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'all' | OrderStatus) => {
    setActiveTab(newValue);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Paper className="mb-4">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map(tab => (
              <MuiTab
                key={tab.id}
                label={tab.label}
                value={tab.id}
                className={activeTab === tab.id ? 'text-red-500' : tab.color}
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      <div className="mb-6">
        <form onSubmit={handleSearch}>
          <TextField
            fullWidth
            name="search"
            placeholder="You can search by shop name, order ID or product name"
            defaultValue={searchTerm}
            InputProps={{
              startAdornment: <Search className="mr-2 h-4 w-4 text-gray-400" />,
            }}
          />
        </form>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Box className="max-w-7xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <Paper key={i} className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton variant="rectangular" width={80} height={80} />
                  <div className="space-y-2 flex-1">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </div>
                </div>
              </Paper>
            ))}
          </Box>
        ) : (
          <>
            {ordersData?.data.map((order) => (
              <Paper key={order.id} className="p-6">
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
                        <Chip
                          label={tabs.find(tab => tab.id === order.status)?.label || order.status}
                          {...getStatusColor(order.status)}
                          size="small"
                        />
                      </div>
                      <p className="text-sm text-gray-500">SKU: {order.sku}</p>
                      <p className="text-sm text-gray-500">
                        Order Date: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(order.total)}
                    </p>
                    {Number(order.original_total) - Number(order.total) > 0 && (
                      <p className="text-sm text-green-600">
                        Saving: {formatCurrency(Number(order.original_total) - Number(order.total))}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end items-center pt-4 space-x-2">
                  <Button
                    component={Link}
                    to={`/account/my-order/${order.id}`}
                    variant="contained"
                    size="small"
                  >
                    View Details
                  </Button>
                  {renderActionButtons(order)}
                </div>
              </Paper>
            ))}

            {(!ordersData?.data || ordersData.data.length === 0) && (
              <Paper className="p-12 text-center text-gray-500">
                No orders found
              </Paper>
            )}

            {ordersData?.pagination && (
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
      </div>

      <Dialog
        open={openDialog.type === 'cancel'}
        onClose={() => setOpenDialog({ type: '', orderId: null })}
      >
        <DialogTitle>Confirm Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog({ type: '', orderId: null })}>No</Button>
          <Button 
            onClick={() => openDialog.orderId && handleCancelOrder(openDialog.orderId)} 
            variant="contained"
            color="error"
          >
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog.type === 'refund'}
        onClose={() => setOpenDialog({ type: '', orderId: null })}
      >
        <DialogTitle>Confirm Refund Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to request a refund for this order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog({ type: '', orderId: null })}>Cancel</Button>
          <Button 
            onClick={() => openDialog.orderId && handleRefundRequest(openDialog.orderId)}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog.type === 'confirm-received'}
        onClose={() => setOpenDialog({ type: '', orderId: null })}
      >
        <DialogTitle>Confirm Order Received</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Have you received your order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog({ type: '', orderId: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => openDialog.orderId && handleConfirmReceived(openDialog.orderId)}
            variant="contained"
            color="success"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}