import React, {useEffect, useState} from 'react';
import {Upload} from "antd";
import {WidgetProps} from "../WidgetProps.js";
import PrimaryButton from "../PrimaryButton.tsx";
import UploadIcon from "../icons/UploadIcon.tsx";
import {Image, Place} from "../../../types.js";
import SecondaryDangerButton from "../SecondaryDangerButton.tsx";

interface PictureInputProps extends WidgetProps {
    onChange: (picture: any) => any;
    initialImage: Image;
    buttonText: string;
    revertId?: string;
}

export default function ImageInput({onChange, initialImage, className, id, revertId, buttonText}: PictureInputProps) {

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
        <SecondaryDangerButton
            className={"margin-md-top"}
            onClick={async () => {
                if (initialImage) {
                    setFileList([{
                        uid: "-1",
                        name: initialImage.name,
                        url: `/images/${initialImage.icon.chunks[0].fileId}`,
                    }]);
                } else {
                    setFileList([]);
                }
                onChange(undefined);
            }}
            id={revertId}
        >
            Revert
        </SecondaryDangerButton>
    </div>;

}