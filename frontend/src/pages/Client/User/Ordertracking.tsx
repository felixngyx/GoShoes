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
        return { Icon: ShoppingCart, label: 'Order Placed', color: 'text-blue-600' };
      case 'processing':
        return { Icon: Package, label: 'Processing', color: 'text-blue-600' };
      case 'shipping':
        return { Icon: Truck, label: 'Shipping', color: 'text-blue-600' };
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
    { id: 'pending', label: 'Order Placed', Icon: ShoppingCart },
    { id: 'processing', label: 'Processing', Icon: Package },
    { id: 'shipping', label: 'Shipping', Icon: Truck },
    { id: 'completed', label: 'Delivered', Icon: CheckCircle2 },
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

  return (
    <div className="w-full py-6">
      {/* Payment Status */}
      <div className="mb-6 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Payment Method:</span>
          <span>{paymentMethod}</span>
        </div>
        <div className={`
          px-3 py-1 rounded-full text-sm
          ${paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : ''}
          ${paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : ''}
        `}>
          {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
        </div>
      </div>

      {/* Order Status */}
      <div className="flex items-center justify-between px-4">
        {mainSteps.map((step, index) => {
          const { Icon } = step;
          const stepStatus = getStepStatus(step.id);
          const StatusIcon = ['cancelled', 'refunded', 'expired', 'failed'].includes(status) 
            ? getStatusInfo(status as OrderStatus).Icon 
            : Icon;

          return (
            <div key={step.id} className="relative flex-1">
              <div className="flex flex-col items-center">
                {/* Connecting Line */}
                {index < mainSteps.length - 1 && (
                  <div className={`
                    absolute w-full h-[2px] top-6 left-[calc(50%+1rem)]
                    ${stepStatus.completed ? 'bg-green-600' : 'bg-gray-300'}
                  `} />
                )}
                
                {/* Step Circle */}
                <div className={`
                  relative z-10
                  rounded-full transition duration-500 ease-in-out
                  border-2 h-12 w-12 flex items-center justify-center bg-white
                  ${stepStatus.completed ? 'border-green-600 bg-green-600' : ''}
                  ${stepStatus.current ? 'border-blue-600' : 'border-gray-300'}
                `}>
                  <StatusIcon 
                    className={`w-6 h-6 ${
                      stepStatus.completed ? 'text-white' : 
                      status === 'completed' && index === mainSteps.length - 1 ? 'text-green-600' : 
                      stepStatus.color
                    }`} 
                  />
                </div>
                
                {/* Step Label */}
                <div className={`mt-3 text-center text-xs font-medium ${stepStatus.color}`}>
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
  );
};

export default OrderTracking;
