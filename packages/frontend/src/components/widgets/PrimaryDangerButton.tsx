import React, {CSSProperties} from 'react';
import {Button} from "antd";
import {WidgetProps} from "./WidgetProps";

interface DangerButtonProps extends WidgetProps {
    onClick: () => any;
    children?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
}

export default function PrimaryDangerButton({onClick, children, style, loading, className, disabled}: DangerButtonProps) {
    return <Button type="primary" danger={true} onClick={onClick} style={style} disabled={loading} className={className}>
        {children}
    </Button>;
}