import React, {CSSProperties} from 'react';
import {SmileTwoTone, UserOutlined} from "@ant-design/icons";


export default function PersonIcon({style, secondaryColor}: {style?: CSSProperties, secondaryColor?: string}) {
    if (secondaryColor)
        return <SmileTwoTone style={style} twoToneColor={secondaryColor}/>;
    return <UserOutlined style={style}/>;
}