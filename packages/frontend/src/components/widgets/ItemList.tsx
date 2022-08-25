import React from 'react';
import {List} from "antd";
import {WidgetProps} from "./WidgetProps";

interface ItemListProps extends WidgetProps {
    children: React.ReactNode;
}

export default function ItemList({children, id}: ItemListProps) {
    const renderedChildren = [React.Children.toArray(children)].map(child => <List.Item>{child}</List.Item>);
    return <List
        bordered={true}
        id={id}
        locale={{ emptyText: <div>No items here</div> }}
    >
        {renderedChildren}
    </List>;
}