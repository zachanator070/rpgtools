import React from 'react';
import {List} from "antd";


export default function ItemList({children, id}: {children: React.ReactNode, id?: string}) {
    const renderedChildren = [React.Children.toArray(children)].map(child => <List.Item>{child}</List.Item>);
    return <List
        bordered={true}
        id={id}
        locale={{ emptyText: <div>No items here</div> }}
    >
        {renderedChildren}
    </List>;
}