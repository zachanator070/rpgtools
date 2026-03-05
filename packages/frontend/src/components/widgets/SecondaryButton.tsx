import React from 'react';
import {Button} from "antd";
import {WidgetProps} from "./WidgetProps";

interface SecondaryButtonProps extends WidgetProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLElement>) => any;
}

export default function SecondaryButton({id, className, style, children, onClick}: SecondaryButtonProps) {
    return <Button id={id} className={className} style={style} onClick={(e) => onClick(e)}>{children}</Button>
}