import React, {ReactComponentElement} from 'react';
import {Modal} from "antd";


export default function FullScreenModal({title, visible, closable, setVisible, children}: {
    title: string,
    visible: boolean,
    closable?: boolean,
    setVisible?: (boolean) => any,
    children?: ReactComponentElement<any>[] | ReactComponentElement<any> | string
}) {
    return <Modal title={title} visible={visible} closable={closable} footer={null} onCancel={setVisible && setVisible(false)}>
        {children && React.Children.toArray(children)}
    </Modal>;
}