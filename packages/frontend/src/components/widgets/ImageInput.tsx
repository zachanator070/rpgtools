import React, {useState} from 'react';
import {Upload} from "antd";
import {WidgetProps} from "./WidgetProps";
import PrimaryButton from "./PrimaryButton";
import UploadIcon from "./icons/UploadIcon";
import {Image, Place} from "../../types";
import DangerButton from "./DangerButton";

interface PictureInputProps extends WidgetProps {
    onChange: (picture: any) => any;
    initialImage: Image;
    buttonText: string;
}

export default function ImageInput({onChange, initialImage, className, id, buttonText}: PictureInputProps) {

   const [fileList, setFileList] = useState([{
       uid: "-1",
       name: initialImage.name,
       url: `/images/${initialImage.icon.chunks[0].fileId}`,
   }]);

    return <Upload
        beforeUpload={async (file) => {
            await onChange(file);
            return false;
        }}
        multiple={false}
        listType={"picture"}
        fileList={fileList}
        onChange={async (files) => {
            await onChange(files.file);
        }}
        className={"upload-list-inline " + className}
        id={id}
    >
        <PrimaryButton>
            <UploadIcon/> {buttonText}
        </PrimaryButton>
        <DangerButton
            className={"margin-md"}
            onClick={async () => {
                setFileList([{
                    uid: "-1",
                    name: initialImage.name,
                    url: `/images/${initialImage.icon.chunks[0].fileId}`,
                }]);
                onChange(undefined);
            }}
            id={'revertMap'}
        >
            Revert
        </DangerButton>
    </Upload>
}