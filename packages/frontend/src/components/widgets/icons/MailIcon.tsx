import React from 'react';
import {MailOutlined} from "@ant-design/icons";


interface MailIconProps {
    className?: string;
}

export default function MailIcon({ className }: MailIconProps) {
    return <MailOutlined className={className}/>;
}