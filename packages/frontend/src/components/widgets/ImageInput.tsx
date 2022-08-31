import React, {useEffect, useState} from 'react';
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

   const [fileList, setFileList] = useState([]);

   useEffect(() => {
       if(initialImage){
           setFileList([{
               uid: "-1",
               name: initialImage.name,
               url: `/images/${initialImage.icon.chunks[0].fileId}`,
           }]);
       }

   }, [initialImage])

    return <div>
        <Upload
            beforeUpload={async (file) => {
                await onChange(file);
                return false;
            }}
            multiple={false}
            listType={"picture"}
            fileList={fileList}
            onChange={async (files) => {
                if (files.file.status === 'removed') {
                    await onChange(null);
                    setFileList([]);
                } else {
                    await onChange(files.file);
                    setFileList(files.fileList.filter(file => file.uid === files.file.uid));
                }

            }}
            className={"upload-list-inline " + className}
            id={id}
        >
            <PrimaryButton>
                <UploadIcon/> {buttonText}
            </PrimaryButton>
        </Upload>
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
    </div>;

}