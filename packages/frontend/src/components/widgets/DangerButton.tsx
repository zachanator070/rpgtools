import React, {CSSProperties} from 'react';
import {Button} from "antd";

export default function DangerButton({onClick, children, style, loading, className}: {onClick: () => any, children?: React.ReactNode, style?: CSSProperties, loading?: boolean, className?: string}) {
    return <Button danger={true} onClick={onClick} style={style} disabled={loading} className={className}>
        {children}
    </Button>;
}