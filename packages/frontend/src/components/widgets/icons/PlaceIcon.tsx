import React, {CSSProperties} from 'react';
import {EnvironmentOutlined, EnvironmentTwoTone} from "@ant-design/icons";


export default function PlaceIcon({style, secondaryColor}: {style?: CSSProperties, secondaryColor?: string}) {
    if (secondaryColor)
        return <EnvironmentTwoTone style={style} twoToneColor={secondaryColor}/>;
    return <EnvironmentOutlined style={style}/>;
}