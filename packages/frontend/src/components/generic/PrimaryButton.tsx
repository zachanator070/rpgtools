import React from 'react';
import {Button} from "antd";

export default function PrimaryButton({className, loading, onClick, children, disabled, submit}: {
    className?: string,
    loading?: boolean,
    disabled?: boolean,
    submit?: boolean,
    onClick?: () => any,
    children?: React.ReactNode
}) {
    return <Button disabled={disabled || loading} className={className} loading={loading} onClick={onClick} htmlType={submit ? "submit": null}>
        {children}
    </Button>;
}