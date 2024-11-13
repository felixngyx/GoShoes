import React from "react";
import { useEffect } from "react";
import Pusher from 'pusher-js';
import { toast } from 'react-hot-toast';
import { PUSHER_CONFIG } from "../../common/pusher";
import { useNavigate } from 'react-router-dom';

interface PusherData {
    order_id: string;
    message: string;
}

interface PusherHookOptions {
    onNewOrder?: (data: PusherData) => void;
    customToast?: boolean;
}

export const usePusherAdmin = (options: PusherHookOptions = {}) => {
    const navigate = useNavigate();

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
                const toastId = toast.success(
                    React.createElement(
                        'div',
                        { className: 'flex flex-col' },
                        React.createElement(
                            'span',
                            null,
                            `${data.message}: ${data.order_id}`
                        ),
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    navigate(`/admin/orders/detail/${data.order_id}`);
                                    toast.dismiss(toastId);
                                },
                                className: 'mt-2 text-sm font-semibold text-white underline hover:no-underline'
                            },
                            'View Details →'
                        )
                    ),
                    {
                        duration: 5000,
                        position: 'top-right',
                        style: {
                            background: '#10B981',
                            color: '#fff',
                            top: '80px',
                        }
                    }
                );
            }
        });

        return () => {
            channel.unbind(PUSHER_CONFIG.events.newOrder);
            pusher.unsubscribe(PUSHER_CONFIG.channels.admin);
            pusher.disconnect();
        };
    }, [options, navigate]);
};