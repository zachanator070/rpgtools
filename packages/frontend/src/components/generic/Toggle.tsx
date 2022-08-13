import React from 'react';
import {Switch} from "antd";

export default function Toggle({checkedChildren, unCheckedChildren, onChange, defaultChecked}: {
    checkedChildren: React.ReactNode,
    unCheckedChildren: React.ReactNode,
    onChange: (boolean) => any,
    defaultChecked: boolean
}) {
    return <Switch
        defaultChecked={defaultChecked}
        checkedChildren={checkedChildren}
        unCheckedChildren={unCheckedChildren}
        onChange={onChange}
    />;
}