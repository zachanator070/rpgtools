import React, {CSSProperties} from 'react';
import {Button} from "antd";

export default function DangerButton({onClick, children, style}: {onClick: () => any, children?: React.ReactNode, style?: CSSProperties}) {
    return <Button danger={true} onClick={onClick} style={style}>
        {children}
    </Button>;
}