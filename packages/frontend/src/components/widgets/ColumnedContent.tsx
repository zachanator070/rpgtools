import React, {CSSProperties} from 'react';
import {WidgetProps} from "./WidgetProps";

interface ColumnedContentProps extends WidgetProps {
    children: React.ReactNode;
    childrenStyles?: CSSProperties[];
    childrenSizes?: number[];
}

export default function ColumnedContent({children, style, childrenStyles, className, childrenSizes}: ColumnedContentProps) {
    const kids = React.Children.toArray(children);
    if (kids.length > 3) {
        throw new Error("ColumnedContent component only supports three columns")
    }
    let leftColumn = kids[0] ?? null;
    let leftStyles = (childrenStyles && childrenStyles[0]) || {};
    let leftSize = childrenSizes ? childrenSizes[0] : 1;

    let centerColumn = kids[1] ?? null;
    let centerStyles = (childrenStyles && childrenStyles[1]) || {};
    let centerSize = childrenSizes ? childrenSizes[1] : 4;

    const rightColumn = kids[2] ?? null;
    const rightStyles = (childrenStyles && childrenStyles[2]) || {};
    const rightSize = childrenSizes ? childrenSizes[2] : 1;

    if (kids.length === 1) {
        leftColumn = null;
        centerColumn = kids[0];
    }
    return <div style={{display: "flex", ...style}}>
        <div style={{flexGrow: leftSize, ...leftStyles}}>
            {leftColumn}
        </div>
        <div style={{flexGrow: centerSize, ...centerStyles}}>
            {centerColumn}
        </div>
        <div style={{flexGrow: rightSize, ...rightStyles}}>
            {rightColumn}
        </div>
    </div>;
}