import React, {CSSProperties} from 'react';
import {WidgetProps} from "./WidgetProps";

interface ColumnedContentProps extends WidgetProps {
    children: React.ReactNode;
    childrenStyles?: CSSProperties[];
}

export default function ColumnedContent({children, style, childrenStyles}: ColumnedContentProps) {
    const kids = React.Children.toArray(children);
    if (kids.length > 3) {
        throw new Error("ColumnedContent component only supports three columns")
    }
    let leftColumn = kids[0] ?? null;
    let leftStyles = (childrenStyles && childrenStyles[0]) || {};
    let centerColumn = kids[1] ?? null;
    let centerStyles = (childrenStyles && childrenStyles[1]) || {};
    const rightColumn = kids[2] ?? null;
    const rightStyles = (childrenStyles && childrenStyles[2]) || {};
    if (kids.length === 1) {
        leftColumn = null;
        centerColumn = kids[0];
    }
    return <div style={{display: "flex", ...style}}>
        <div style={{flexGrow: 4, ...leftStyles}}>
            {leftColumn}
        </div>
        <div style={{flexGrow: 16, ...centerStyles}}>
            {centerColumn}
        </div>
        <div style={{flexGrow: 4, ...rightStyles}}>
            {rightColumn}
        </div>
    </div>;
}