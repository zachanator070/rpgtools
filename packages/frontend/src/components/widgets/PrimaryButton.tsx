import React from 'react';
import {Button} from "antd";
import {WidgetProps} from "./WidgetProps";

interface PrimaryButtonProps extends WidgetProps {
    loading?: boolean;
    disabled?: boolean;
    submit?: boolean;
    onClick?: () => any;
    children?: React.ReactNode;
}

export default function PrimaryButton({className, loading, onClick, children, disabled, submit, style, id}: PrimaryButtonProps) {
    return <Button disabled={disabled || loading} className={className} loading={loading} onClick={onClick} htmlType={submit ? "submit": null} style={style} id={id}>
        {children}
    </Button>;
}