import React, {useEffect, useState} from 'react';
import {Upload} from "antd";
import {WidgetProps} from "../WidgetProps";
import PrimaryButton from "../PrimaryButton";
import UploadIcon from "../icons/UploadIcon";
import {Image, Place} from "../../../types";
import SecondaryDangerButton from "../SecondaryDangerButton";

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
            <PrimaryButton onClick={(e) => e.preventDefault()}>
                <UploadIcon/> {buttonText}
            </PrimaryButton>
        </Upload>
        <SecondaryDangerButton
            className={"margin-md-top margin-md-bottom"}
            onClick={async (e) => {
                e.preventDefault();
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