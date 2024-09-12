import React from 'react';
import {Button} from "antd";
import {WidgetProps} from "./WidgetProps.js";

interface SecondaryButtonProps extends WidgetProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLElement>) => any;
}

export default function SecondaryButton({children, onClick}: SecondaryButtonProps) {
    return <Button onClick={(e) => onClick(e)}>{children}</Button>
}