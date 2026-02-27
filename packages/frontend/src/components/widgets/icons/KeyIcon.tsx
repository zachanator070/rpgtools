import React from 'react';
import {KeyOutlined} from "@ant-design/icons";


interface KeyIconProps {
    className?: string;
}

export default function KeyIcon({ className }: KeyIconProps) {
    return <KeyOutlined className={className}/>;
}