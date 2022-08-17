import React from 'react';
import {Modal} from "antd";

interface ModalConfirmProps {
    title: string,
    content: React.ReactNode,
    okText?: string,
    cancelText?: string,
    onOk: () => any
}

export default function useModal() {
    return {
        modalConfirm: (props: ModalConfirmProps) => {
            Modal.confirm({...props, closable: false});
        },
        modalWarning: (props: ModalConfirmProps) => {
            Modal.warning({...props, closable: false});
        }
    };
}