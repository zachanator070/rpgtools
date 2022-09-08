import React, {CSSProperties} from 'react';
import {FileTextOutlined, FileTextTwoTone, FileTwoTone} from "@ant-design/icons";


export default function FileIcon({style, secondaryColor}: {style?: CSSProperties, secondaryColor?: string}) {
    if (secondaryColor)
        return <FileTextTwoTone style={style} twoToneColor={secondaryColor}/>;
    return <FileTextOutlined style={style}/>;
}