import React, {useEffect, useState} from 'react';
import {CloseOutlined, MenuOutlined} from "@ant-design/icons";
import {
    ADD_MODEL_CONTROLS,
    FOG_CONTROLS,
    PAINT_CONTROLS,
    SELECT_LOCATION_CONTROLS,
    SELECT_MODEL_CONTROLS
} from "../../rendering/GameRenderer";
import {BrushOptions} from "./BrushOptions";
import {FogOptions} from "./FogOptions";
import {ModelInfo} from "./ModelInfo";
import {GameLocationSettings} from "./GameLocationSettings";
import {AddModelSection} from "./AddModelSection";

export const ControlsContextWindow = ({renderer, controlsMode, setGameWikiId}) => {

    const [visible, setVisible] = useState();

    useEffect(() => {
        (async () => {
            await setVisible(true);
        })()
    }, [controlsMode]);

    let content = null;

    switch(controlsMode){
        case PAINT_CONTROLS:
            content = <BrushOptions renderer={renderer}/>;
            break;
        case FOG_CONTROLS:
            content = <FogOptions renderer={renderer}/>;
            break;
        case SELECT_MODEL_CONTROLS:
            content = <ModelInfo renderer={renderer} setGameWikiId={setGameWikiId}/>;
            break;
        case SELECT_LOCATION_CONTROLS:
            content = <GameLocationSettings setGameWikiId={setGameWikiId}/>;
            break;
        case ADD_MODEL_CONTROLS:
            content = <AddModelSection/>;
    }

    if(!content){
        return <></>;
    }

    return <>
        <a onClick={async () => await setVisible(true)}>
            <div
                className={'margin-lg padding-md'}
                style={{
                    borderRadius: '10px',
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    backgroundColor: 'white'
                }}
            >
                <MenuOutlined />
            </div>
        </a>

        <div
            className={'padding-lg'}
            style={{
                display: visible ? 'block' : 'none',
                position: 'absolute',
                right: '0px',
                bottom: '0px',
                height: '50%',
                width: '33%',
                backgroundColor: 'white',
                overflowY: 'scroll',
                borderTop: 'thin solid grey'
            }}
        >
            <span>
                <a className={'margin-md'} onClick={async () => await setVisible(false)}>
                    <CloseOutlined />
                </a>
                <h2
                    style={{
                        display: 'inline'
                    }}
                >{controlsMode}</h2>
            </span>
            {content}
        </div>
    </>;
};