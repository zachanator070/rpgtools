import React, {ReactComponentElement} from 'react';
import {Modal} from "antd";
import {WidgetProps} from "./WidgetProps";

interface FullScreenModalProps extends WidgetProps {
    title: string;
    visible: boolean;
    closable?: boolean;
    setVisible?: (boolean) => any;
    children?: React.ReactNode;
    width?: string | number;
}

export default function FullScreenModal({title, visible, closable, setVisible, children, style, width}: FullScreenModalProps) {
    return <Modal
        title={title}
        visible={visible}
        footer={null}
        onCancel={async () => {
            if (setVisible) {
                await setVisible(false);
            }
        }}
        style={style}
        closable={closable}
        maskClosable={closable}
        width={width}
    >
        {children && React.Children.toArray(children)}
    </Modal>;
}