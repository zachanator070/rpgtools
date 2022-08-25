import React, {CSSProperties} from 'react';
import {WidgetProps} from "./WidgetProps";

interface ColumnedContentProps extends WidgetProps {
    children: React.ReactNode;
}

export default function ColumnedContent({children, style}: ColumnedContentProps) {
    const kids = React.Children.toArray(children);
    if (kids.length > 3) {
        throw new Error("ColumnedContent component only supports three columns")
    }
    const leftColumn = kids[0] ?? null;
    let centerColumn = kids[1] ?? null;
    const rightColumn = kids[2] ?? null;
    if (kids.length === 1) {
        centerColumn = kids[0];
    }
    return <div style={{display: "flex", ...style}}>
        <div style={{flexGrow: 4}}>
            {leftColumn}
        </div>
        <div style={{flexGrow: 16}}>
            {centerColumn}
        </div>
        <div style={{flexGrow: 4}}>
            {rightColumn}
        </div>
    </div>;
}