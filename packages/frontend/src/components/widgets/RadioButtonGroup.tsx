import React, {ReactElement} from 'react';
import {Radio} from "antd";
import {WidgetProps} from "./WidgetProps";
import {RadioButtonProps} from "./RadioButton";

interface RadioGroupProps extends WidgetProps {
    onChange: (string) => any,
    defaultValue: string,
    children: ReactElement<RadioButtonProps> | ReactElement<RadioButtonProps>[]
}

export default function RadioButtonGroup({onChange, defaultValue, children}: RadioGroupProps) {

    return <Radio.Group onChange={(e) => onChange(e.target.value)} defaultValue={defaultValue}>
        {children}
    </Radio.Group>;
}