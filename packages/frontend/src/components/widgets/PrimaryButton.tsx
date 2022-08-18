import React, {CSSProperties} from 'react';
import {Button} from "antd";

export default function PrimaryButton({className, loading, onClick, children, disabled, submit, style, id}: {
    className?: string,
    loading?: boolean,
    disabled?: boolean,
    submit?: boolean,
    onClick?: () => any,
    children?: React.ReactNode,
    style?: CSSProperties,
    id?: string;
}) {
    return <Button disabled={disabled || loading} className={className} loading={loading} onClick={onClick} htmlType={submit ? "submit": null} style={style} id={id}>
        {children}
    </Button>;
}