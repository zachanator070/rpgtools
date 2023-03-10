import React from 'react';
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import VerticalBar from "../widgets/VerticalBar";
import {Link} from "react-router-dom";

export default function WorldLinks() {
    const {currentWorld} = useCurrentWorld();
    interface LinkData {
        label: string;
        link: string;
    }
    if(!currentWorld) {
        return <></>;
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
    return <>
        {currentWorld &&
            <div>
                {
                    links.map(
                        (link, index) => <span key={index}>
                            <VerticalBar/>
                            <Link to={link.link}>{link.label}</Link>
                        </span>
                    )
                }
                <VerticalBar/>
            </div>
        }
    </>;
}