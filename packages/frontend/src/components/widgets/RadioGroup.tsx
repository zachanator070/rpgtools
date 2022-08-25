import React, {ReactElement} from 'react';
import {Radio} from "antd";
import {WidgetProps} from "./WidgetProps";

interface RadioButtonProps extends WidgetProps {
    onChange: (string) => any,
    defaultValue: string,
    children: ReactElement<RadioButtonProps> | ReactElement<RadioButtonProps>[]
}

export default function RadioGroup({onChange, defaultValue, children}: RadioButtonProps) {
    return <Radio>
        {children}
    </Radio>
}