import React, {CSSProperties} from 'react';
import {Tabs} from "antd";
import {WidgetProps} from "./WidgetProps";

export interface TabPaneProps  {
    title: string;
    style?: CSSProperties;
    children?: React.ReactNode;
    closable?: boolean;
}

interface TabCollectionProps extends WidgetProps {
    activeKey?: string;
    onChange?: (key: string) => any;
    tabs: TabPaneProps[];
    tabPosition?: 'left' | 'right' | 'top' | 'bottom';
    onEdit?: (targetKey: React.MouseEvent | React.KeyboardEvent | string,
              action: 'add' | 'remove') => any;
}

export default function TabCollection({activeKey, onChange, style, tabs, tabPosition, onEdit = undefined}: TabCollectionProps) {
    if (!tabPosition) {
        tabPosition = 'top';
    }
    return <Tabs
        activeKey={activeKey}
        onChange={onChange}
        style={style}
        type={onEdit ? "editable-card" : "card"}
        tabPosition={tabPosition}
        onEdit={onEdit}
    >
        {tabs.map((tab, index) => (
            <Tabs.TabPane tab={tab.title} style={tab.style} key={tab.title} closable={tab.closable}>
                {tab.children}
            </Tabs.TabPane>
        ))}
    </Tabs>;
}