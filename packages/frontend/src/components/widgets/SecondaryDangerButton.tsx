import React, {CSSProperties, MouseEventHandler} from 'react';
import {Button} from "antd";
import {WidgetProps} from "./WidgetProps";

interface DangerButtonProps extends WidgetProps {
    onClick: MouseEventHandler;
    children?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
}

export default function SecondaryDangerButton({onClick, children, style, loading, className, disabled, id}: DangerButtonProps) {
    return <Button id={id} danger={true} onClick={onClick} style={style} disabled={loading || disabled} className={className}>
        {children}
    </Button>;
}