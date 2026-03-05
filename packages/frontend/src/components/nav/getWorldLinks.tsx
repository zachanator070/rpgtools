import React from 'react';
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import VerticalBar from "../widgets/VerticalBar";
import {Link} from "react-router-dom";
import { NavComponent } from './NavBar';

export default function getWorldLinks(): NavComponent[]{
    const {currentWorld} = useCurrentWorld();
    interface LinkData {
        label: string;
        link: string;
    }
    if(!currentWorld) {
        return [];
    }
    const links: LinkData[] = [
        {
            label: 'Map',
            link: `/ui/world/${currentWorld._id}/map/${currentWorld.wikiPage._id}`
        },
        {
            label: 'Wiki',
            link: `/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`
        },
        {
            label: 'Models',
            link: `/ui/world/${currentWorld._id}/model`
        },
        {
            label: 'Tokens',
            link: `/ui/world/${currentWorld._id}/tokens`
        },
        {
            label: 'Roles',
            link: `/ui/world/${currentWorld._id}/roles`
        },
        {
            label: 'Game',
            link: `/ui/world/${currentWorld._id}/gameLogin`
        },
        {
            label: 'Timeline',
            link: `/ui/world/${currentWorld._id}/timeline`
        }
    ];
    
    return links.map((link, index) => ({
        key: `worldLink-${index}`,
        component: <Link to={link.link}>{link.label}</Link>
    }));
}