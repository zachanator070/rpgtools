import React, {CSSProperties} from 'react';
import {Button} from "antd";
import {WidgetProps} from "./WidgetProps";

interface DangerButtonProps extends WidgetProps {
    onClick: () => any;
    children?: React.ReactNode;
    loading?: boolean;
}

export default function DangerButton({onClick, children, style, loading, className}: DangerButtonProps) {
    return <Button danger={true} onClick={onClick} style={style} disabled={loading} className={className}>
        {children}
    </Button>;
}