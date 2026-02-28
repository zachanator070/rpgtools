import React from 'react';
import {UserOutlined} from "@ant-design/icons";


interface PersonIconProps {
    className?: string;
}

export default function PersonIcon({ className }: PersonIconProps) {
    return <UserOutlined className={className}/>;
}