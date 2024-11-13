import { usePusherAdmin } from "../../hooks/admin/pusher";


const OrderNotifications = () => {
    usePusherAdmin({
        onNewOrder: (data) => {
          console.log('New order:', data);
        }
      });
    return null;
};

export default OrderNotifications;