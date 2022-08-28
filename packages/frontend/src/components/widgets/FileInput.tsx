import React from 'react';
import {Upload} from "antd";
import PrimaryButton from "./PrimaryButton";
import UploadIcon from "./icons/UploadIcon";


export default function FileInput() {
    return <Upload maxCount={1} multiple={false} beforeUpload={() => false}>
        <PrimaryButton><UploadIcon/> Select File</PrimaryButton>
    </Upload>;
}