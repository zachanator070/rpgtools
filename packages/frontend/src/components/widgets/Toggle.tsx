import React from 'react';
import {Switch} from "antd";
import {WidgetProps} from "./WidgetProps.js";

interface ToggleProps extends WidgetProps {
    checkedChildren: React.ReactNode;
    unCheckedChildren: React.ReactNode;
    onChange: (boolean) => any;
    defaultChecked: boolean;
}

export default function Toggle({checkedChildren, unCheckedChildren, onChange, defaultChecked}: ToggleProps) {
    return <Switch
        defaultChecked={defaultChecked}
        checkedChildren={checkedChildren}
        unCheckedChildren={unCheckedChildren}
        onChange={onChange}
    />;
}