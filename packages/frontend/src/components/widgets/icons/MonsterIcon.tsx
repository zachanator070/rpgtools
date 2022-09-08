import React, {CSSProperties} from 'react';
import {BugOutlined, BugTwoTone} from "@ant-design/icons";


export default function MonsterIcon({style, secondaryColor}: {style?: CSSProperties, secondaryColor?: string}) {
    if (secondaryColor)
        return <BugTwoTone style={style} twoToneColor={secondaryColor}/>;
    return <BugOutlined style={style}/>;
}