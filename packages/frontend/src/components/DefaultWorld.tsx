import React, {useEffect} from 'react';
import useServerConfig from "../hooks/server/useServerConfig.js";
import {useNavigate} from "react-router-dom";
import LoadingView from "./LoadingView.js";
import DefaultView from "./DefaultView.js";


export default function DefaultWorld() {
    const {serverConfig, loading} = useServerConfig();
    const navigate = useNavigate();

    useEffect(() => {
        if(serverConfig && serverConfig.defaultWorld) {
            navigate(`/ui/world/${serverConfig.defaultWorld._id}/map/${serverConfig.defaultWorld.wikiPage._id}`);
        }
    }, [serverConfig]);

    if (loading) {
        return <LoadingView/>;
    }

    return <DefaultView/>;
}