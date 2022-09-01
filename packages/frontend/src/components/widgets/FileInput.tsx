import React from 'react';
import {Upload} from "antd";
import PrimaryButton from "./PrimaryButton";
import UploadIcon from "./icons/UploadIcon";

interface FileInputProps {
    onChange: (any) => any;
}

export default function FileInput({onChange}: FileInputProps) {
    return <Upload maxCount={1} multiple={false} beforeUpload={() => false} onChange={onChange}>
        <PrimaryButton onClick={(e) => e.preventDefault()}><UploadIcon/> Select File</PrimaryButton>
    </Upload>;
}