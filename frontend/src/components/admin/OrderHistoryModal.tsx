import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText 
} from '@mui/material';
import { Clock } from 'lucide-react';

type OrderStatus = 'shipping' | 'cancelled' | 'expired' | 'completed' | 'pending' | 'processing';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  shipping: 'Đang giao hàng',
  cancelled: 'Đã hủy',
  expired: 'Đã hết hạn',
  completed: 'Đã hoàn thành',
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý'
};

interface OrderHistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: Array<{
    user: string;
    time: string;
    status_before: string;
    status_after: string;
  }>;
  orderSku: string;
}

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  open, 
  onClose, 
  history,
  orderSku
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Lịch sử trạng thái đơn hàng #{orderSku}
      </DialogTitle>
      <DialogContent>
        {history.length === 0 ? (
          <DialogContentText>
            Không có lịch sử thay đổi trạng thái cho đơn hàng này.
          </DialogContentText>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {entry.user} ({entry.role})
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.time).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Chuyển từ 
                  <span className="mx-1 font-medium text-red-500">
                    {ORDER_STATUS_LABELS[entry.status_before as OrderStatus] || entry.status_before}
                  </span>
                  sang 
                  <span className="mx-1 font-medium text-green-500">
                    {ORDER_STATUS_LABELS[entry.status_after as OrderStatus] || entry.status_after}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderHistoryModal;

