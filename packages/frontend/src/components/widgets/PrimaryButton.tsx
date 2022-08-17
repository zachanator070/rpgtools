import React, {CSSProperties} from 'react';
import {Button} from "antd";

export default function PrimaryButton({className, loading, onClick, children, disabled, submit, style}: {
    className?: string,
    loading?: boolean,
    disabled?: boolean,
    submit?: boolean,
    onClick?: () => any,
    children?: React.ReactNode,
    style?: CSSProperties
}) {
    return <Button disabled={disabled || loading} className={className} loading={loading} onClick={onClick} htmlType={submit ? "submit": null} style={style}>
        {children}
    </Button>;
}