import React from 'react';
import {Breadcrumb} from "antd";


export default function Breadcrumbs({children}: {children: React.ReactNode}) {
    const kids = [...React.Children.toArray(children)].map((child, index) => <Breadcrumb.Item key={index}>
        {child}
    </Breadcrumb.Item>)
    return <Breadcrumb>
        {kids}
    </Breadcrumb>
}