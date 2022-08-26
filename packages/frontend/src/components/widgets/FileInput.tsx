import React from 'react';
import {Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import PrimaryButton from "./PrimaryButton";


export default function FileInput() {
    return <Upload maxCount={1} multiple={false} beforeUpload={() => false}>
        <PrimaryButton><UploadOutlined/> Select File</PrimaryButton>
    </Upload>
}