import React from 'react';
import {Upload} from "antd";
import PrimaryButton from "../PrimaryButton";
import UploadIcon from "../icons/UploadIcon";

interface FileInputProps {
    onChange: (any) => any;
    accept?: string;
}

export default function FileInput({onChange, accept}: FileInputProps) {
    return <Upload maxCount={1} multiple={false} beforeUpload={() => false} onChange={onChange} accept={accept}>
        <PrimaryButton onClick={(e) => e.preventDefault()}><UploadIcon/> Select File</PrimaryButton>
    </Upload>;
}