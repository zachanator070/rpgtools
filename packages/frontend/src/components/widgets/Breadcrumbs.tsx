import React from 'react';
import {Breadcrumb} from "antd";
import {WidgetProps} from "./WidgetProps";
import './Breadcrumbs.css';

interface BreadcrumbsProps extends WidgetProps {
    children: React.ReactNode
}

export default function Breadcrumbs({children}: BreadcrumbsProps) {
    const kids = [...React.Children.toArray(children)].map((child, index) => <Breadcrumb.Item key={index}>
        {child}
    </Breadcrumb.Item>)
    return <Breadcrumb>
        {kids}
    </Breadcrumb>
}