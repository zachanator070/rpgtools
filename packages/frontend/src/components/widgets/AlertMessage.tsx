import React from 'react';
import {Alert} from "antd";

export default function AlertMessage({error}: {error: string}) {
    return <Alert key={error} message={error} type={"error"} showIcon closable />;
}