import React, {CSSProperties} from 'react';
import {Button} from "antd";
import {WidgetProps} from "./WidgetProps.js";

interface DangerButtonProps extends WidgetProps {
    onClick: () => any;
    children?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
}

export default function PrimaryDangerButton({onClick, children, style, loading, className, disabled, id}: DangerButtonProps) {
    return <Button id={id} type="primary" danger={true} onClick={onClick} style={style} disabled={loading || disabled} className={className}>
        {children}
    </Button>;
}