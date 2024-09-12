import React from 'react';
import {List} from "antd";
import {WidgetProps} from "./WidgetProps.js";

interface ItemListProps extends WidgetProps {
    children: React.ReactNode;
}

export default function ItemList({children, id}: ItemListProps) {
    return <List
        bordered={true}
        id={id}
        locale={{ emptyText: <div>No items here</div> }}
        dataSource={React.Children.toArray(children)}
        renderItem={(child, index) => <List.Item key={index}>{child}</List.Item>}
    />;
}