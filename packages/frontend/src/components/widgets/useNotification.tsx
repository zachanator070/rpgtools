import React from 'react';
import {notification} from "antd";
import "./Notification.css";

interface NotificationProps {
    message: string;
    description: string;
}

export default function useNotification() {
    return {
        errorNotification: (props: NotificationProps) => {
            notification['error']({
                ...props,
                className: "themed-error-notification",
            });
        }
    }
}