import { CheckCircle2, CircleDashed, Truck, Package, ShoppingCart, XCircle, RefreshCcw, Clock } from 'lucide-react';
import { OrderStatus } from '../../../types/client/order';

interface OrderTrackingProps {
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ status, paymentStatus, paymentMethod }) => {
  const getStatusInfo = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case 'pending':
        return { Icon: ShoppingCart, label: 'Đã đặt hàng', color: 'text-blue-600' };
      case 'processing':
        return { Icon: Package, label: 'Đang xử lý', color: 'text-blue-600' };
      case 'shipping':
        return { Icon: Truck, label: 'Đang vận chuyển', color: 'text-blue-600' };
      case 'completed':
        return { Icon: CheckCircle2, label: 'Delivered', color: 'text-green-600' };
      case 'cancelled':
        return { Icon: XCircle, label: 'Cancelled', color: 'text-red-600' };
      case 'refunded':
        return { Icon: RefreshCcw, label: 'Refunded', color: 'text-orange-600' };
      case 'expired':
        return { Icon: Clock, label: 'Expired', color: 'text-gray-600' };
      case 'failed':
        return { Icon: XCircle, label: 'Failed', color: 'text-red-600' };
      default:
        return { Icon: CircleDashed, label: 'Unknown', color: 'text-gray-400' };
    }
  };

  const mainSteps = [
    { id: 'pending', label: 'Đã đặt hàng', Icon: ShoppingCart },
    { id: 'processing', label: 'Đang xử lý', Icon: Package },
    { id: 'shipping', label: 'Đang vận chuyển', Icon: Truck },
    { id: 'completed', label: 'Hoàn tất ', Icon: CheckCircle2 },
  ] as const;

  const getStepStatus = (stepId: string) => {
    const statusOrder = ['pending', 'processing', 'shipping', 'completed'];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepId);

    if (['cancelled', 'refunded', 'expired', 'failed'].includes(status)) {
      const statusInfo = getStatusInfo(status as OrderStatus);
      return {
        completed: false,
        current: false,
        color: statusInfo.color
      };
    }

    if (status === 'completed') {
      return {
        completed: stepIndex <= statusOrder.indexOf('completed'),
        current: stepIndex === statusOrder.indexOf('completed'),
        color: stepIndex <= statusOrder.indexOf('completed') ? 'text-green-600' : 'text-gray-400'
      };
    }

    if (stepIndex < currentIndex) return { completed: true, current: false, color: 'text-green-600' };
    if (stepIndex === currentIndex) return { completed: false, current: true, color: 'text-blue-600' };
    return { completed: false, current: false, color: 'text-gray-400' };
  };

  const StatusIcon = getStatusInfo(status as OrderStatus).Icon;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Payment Status - Responsive Layout */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm sm:text-base">Phương thức:</span>
          <span className="text-sm sm:text-base">{paymentMethod}</span>
        </div>
        <div className={`
          px-3 py-1 rounded-full text-sm inline-flex items-center justify-center
          ${paymentStatus === 'success' ? 'bg-green-100 text-green-800' : ''}
          ${paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : ''}
        `}>
          {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
        </div>
      </div>

      {/* Order Status - Responsive Layout */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          {mainSteps.map((step, index) => {
            const stepStatus = getStepStatus(step.id);
            const isLastStep = index === mainSteps.length - 1;
            
            return (
              <div key={step.id} className="relative flex-1 w-full sm:w-auto">
                <div className="flex flex-row sm:flex-col items-center justify-center gap-4 sm:gap-0">
                  {/* Connecting Line - Adjusted positioning */}
                  {!isLastStep && (
                    <>
                      {/* Vertical line for mobile */}
                      <div className={`
                        absolute h-full w-[2px] left-6 top-12
                        ${stepStatus.completed ? 'bg-green-600' : 'bg-gray-300'}
                        sm:hidden
                      `} />
                      {/* Horizontal line for desktop - Adjusted width and positioning */}
                      <div className={`
                        hidden sm:block absolute w-full h-[2px]
                        ${stepStatus.completed ? 'bg-green-600' : 'bg-gray-300'}
                        top-6 left-1/2
                      `} />
                    </>
                  )}
                  
                  {/* Step Circle */}
                  <div className={`
                    relative z-20
                    rounded-full transition duration-500 ease-in-out
                    border-2 h-12 w-12 flex items-center justify-center
                    ${stepStatus.completed ? 'border-green-600' : ''}
                    ${stepStatus.current ? 'border-blue-600' : 'border-gray-300'}
                    ${stepStatus.completed ? 'bg-green-600/20' : 'bg-white'}
                    shrink-0
                  `}>
                    {['cancelled', 'refunded', 'expired', 'failed'].includes(status) && index === 0 ? (
                      <StatusIcon 
                        className={`w-6 h-6 ${stepStatus.color}`} 
                      />
                    ) : (
                      <step.Icon 
                        className={`w-6 h-6 ${stepStatus.color}`} 
                      />
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className={`
                    text-sm font-medium ${stepStatus.color}
                    sm:mt-3 sm:text-center whitespace-nowrap
                  `}>
                    {['cancelled', 'refunded', 'expired', 'failed'].includes(status) && index === 0
                      ? getStatusInfo(status as OrderStatus).label
                      : step.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

