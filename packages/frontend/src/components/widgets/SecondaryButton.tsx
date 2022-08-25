import React from 'react';
import {Button} from "antd";
import {WidgetProps} from "./WidgetProps";

interface SecondaryButtonProps extends WidgetProps {
    children: React.ReactNode
}

export default function SecondaryButton({children}: SecondaryButtonProps) {
    return <Button>{children}</Button>
}