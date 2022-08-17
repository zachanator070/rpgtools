import React from 'react';
import {List} from "antd";


export default function ItemList({children}: {children: React.ReactNode}) {
    const renderedChildren = [React.Children.toArray(children)].map(child => <List.Item>{child}</List.Item>);
    return <List
        bordered={true}
    >
        {renderedChildren}
    </List>;
}