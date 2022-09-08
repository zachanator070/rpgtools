import React from 'react';
import {
    ARTICLE_PIN,
    DEFAULT_PIN,
    ITEM_PIN,
    MONSTER_PIN,
    PERSON_PIN,
    PLACE_PIN
} from "@rpgtools/common/src/pin-constants";
import FileIcon from "../widgets/icons/FileIcon";
import ItemIcon from "../widgets/icons/ItemIcon";
import MonsterIcon from "../widgets/icons/MonsterIcon";
import PlaceIcon from "../widgets/icons/PlaceIcon";
import PersonIcon from "../widgets/icons/PersonIcon";
import DefaultPinIcon from "./DefaultPinIcon";

import pSBC from './pSBC.js';


export default function BuiltInPinIcon({type, size, color}: {type: string, size?: number, color?: string}) {
    if (!size) {
        size = 1;
    }
    switch (type) {
        case ARTICLE_PIN:
            return <FileIcon style={{fontSize: size + 'em', color: color}} secondaryColor={pSBC(.1, color)}/>;
        case ITEM_PIN:
            return <ItemIcon style={{fontSize: size + 'em', color: color}} secondaryColor={pSBC(.1, color)}/>;
        case MONSTER_PIN:
            return <MonsterIcon style={{fontSize: size + 'em', color: color}} secondaryColor={pSBC(.1, color)}/>;
        case PLACE_PIN:
            return <PlaceIcon style={{fontSize: size + 'em', color: color}} secondaryColor={pSBC(.1, color)}/>;
        case PERSON_PIN:
            return <PersonIcon style={{fontSize: size + 'em', color: color}} secondaryColor={pSBC(.1, color)}/>;
        case DEFAULT_PIN:
            return <DefaultPinIcon size={size} color={color}/>;
        default:
            return <DefaultPinIcon size={size} color={color}/>;
    }
}