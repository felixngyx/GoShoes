import { useEffect } from "react";
import Pusher from 'pusher-js';
import { toast } from 'react-hot-toast';
import { PUSHER_CONFIG } from "../../common/pusher";


interface PusherData {
    order_id: string;
    message: string;
}

interface PusherHookOptions {
    onNewOrder?: (data: PusherData) => void;
    customToast?: boolean;
}

export const usePusherAdmin = (options: PusherHookOptions = {}) => {
    useEffect(() => {
        const pusher = new Pusher(PUSHER_CONFIG.key, {
            cluster: PUSHER_CONFIG.cluster,
        });

        const channel = pusher.subscribe(PUSHER_CONFIG.channels.admin);

        channel.bind(PUSHER_CONFIG.events.newOrder, (data: PusherData) => {
            if (options.onNewOrder) {
                options.onNewOrder(data);
            }

            if (!options.customToast) {
                toast.success(`${data.message}: ${data.order_id}`, {
                    duration: 5000,
                    position: 'top-right',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                        top: '80px',
                    },
                });
            }
        });

        return () => {
            channel.unbind(PUSHER_CONFIG.events.newOrder);
            pusher.unsubscribe(PUSHER_CONFIG.channels.admin);
            pusher.disconnect();
        };
    }, [options]);
};