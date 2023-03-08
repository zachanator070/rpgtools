import React from 'react';
import {Timeline} from "antd";

interface TimelineItem {
    children: React.ReactNode;
    label: string;
}

export default function VerticalTimeline({items}: {items: TimelineItem[]}) {
    return <Timeline mode={'left'}>
        {items.map(
            (item, index) =>
                <Timeline.Item label={item.label} key={index}>{item.children}</Timeline.Item>
        )}
    </Timeline>;
}