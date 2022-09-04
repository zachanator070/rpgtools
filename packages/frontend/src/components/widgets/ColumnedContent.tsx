import React, {CSSProperties} from 'react';
import {WidgetProps} from "./WidgetProps";

interface ColumnedContentProps extends WidgetProps {
    children: React.ReactNode;
    childrenStyles?: CSSProperties[];
    childrenSizes?: string[];
    stickySides?: boolean;
}

export default function ColumnedContent({children, style, childrenStyles, className, childrenSizes, stickySides}: ColumnedContentProps) {
    const kids = React.Children.toArray(children);
    if (kids.length > 3) {
        throw new Error("ColumnedContent component only supports three columns")
    }
    let leftColumn = kids[0] ?? null;
    let leftSize = childrenSizes ? childrenSizes[0] : '20%';
    let leftStyles: CSSProperties = {width: leftSize};
    if(childrenStyles && childrenStyles[0]) {
        leftStyles = Object.assign(leftStyles, childrenStyles[0])
    }
    if (stickySides) {
        leftStyles.position = 'sticky';
        leftStyles.top = '0';
        leftStyles.overflowY = 'auto';
    }

    let centerColumn = kids[1] ?? null;
    let centerSize = childrenSizes ? childrenSizes[1] : '60%';
    let centerStyles: CSSProperties = {width: centerSize};
    if(childrenStyles && childrenStyles[0]) {
        centerStyles = Object.assign(centerStyles, childrenStyles[1])
    }

    const rightColumn = kids[2] ?? null;
    const rightSize = childrenSizes ? childrenSizes[2] : '20%';
    let rightStyles: CSSProperties = {width: rightSize};
    if(childrenStyles && childrenStyles[0]) {
        rightStyles = Object.assign(rightStyles, childrenStyles[2])
    }
    if (stickySides) {
        rightStyles.position = 'sticky';
        rightStyles.top = '0';
        rightStyles.overflowY = 'auto';
    }

    if (kids.length === 1) {
        leftColumn = null;
        centerColumn = kids[0];
    }
    return <div style={{display: "flex", overflow: 'auto', ...style}} className={className}>
        <div style={{...leftStyles}}>
            {leftColumn}
        </div>
        <div style={{...centerStyles}}>
            {centerColumn}
        </div>
        <div style={{...rightStyles}}>
            {rightColumn}
        </div>
    </div>;
}