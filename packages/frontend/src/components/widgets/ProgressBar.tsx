import React from 'react';
import {Progress} from "antd";

interface StrokeColor {
    from: string,
    to: string
}

export default function ProgressBar({strokeColor, percent}: {strokeColor: StrokeColor, percent: number}) {
    return <Progress
        percent={percent}
        strokeColor={strokeColor}
        status="active"
        showInfo={false}
    />
}