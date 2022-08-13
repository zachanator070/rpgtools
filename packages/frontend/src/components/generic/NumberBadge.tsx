import React from 'react';
import {Badge} from "antd";

export default function NumberBadge({count, children}: {count: number, children: React.ReactNode}) {
    return <Badge count={count}>
        {children}
    </Badge>;
}