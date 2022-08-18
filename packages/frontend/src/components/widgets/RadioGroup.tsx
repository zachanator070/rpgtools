import React, {ReactElement} from 'react';
import {RadioButtonProps} from "./RadioButton";
import {Radio} from "antd";


export default function RadioGroup({onChange, defaultValue, children}: {
    onChange: (string) => any,
    defaultValue: string,
    children: ReactElement<RadioButtonProps> | ReactElement<RadioButtonProps>[]
}) {
    return <Radio>
        {children}
    </Radio>
}