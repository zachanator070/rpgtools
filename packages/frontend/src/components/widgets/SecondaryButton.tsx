import React from 'react';
import {Button} from "antd";


export default function SecondaryButton({children}: {children: React.ReactNode}) {
    return <Button>{children}</Button>
}