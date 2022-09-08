import React, {CSSProperties} from 'react';
import {CrownOutlined, CrownTwoTone} from "@ant-design/icons";


export default function ItemIcon({style, secondaryColor}: {style?: CSSProperties, secondaryColor?: string}) {
    if (secondaryColor)
        return <CrownTwoTone style={style} twoToneColor={secondaryColor}/>;
    return <CrownOutlined style={style} />;
}