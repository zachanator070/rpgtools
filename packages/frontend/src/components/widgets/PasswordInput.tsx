import React from 'react';
import {Input} from "antd";


export default function PasswordInput({id}: {id?: string}) {
    return <Input.Password id={id}/>;
}