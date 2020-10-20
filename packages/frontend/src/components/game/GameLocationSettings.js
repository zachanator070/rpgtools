import React, {useState} from 'react';
import {SelectWiki} from "../select/SelectWiki";
import {PLACE} from "@rpgtools/common/src/type-constants";
import {Button, Checkbox} from "antd";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import {useSetGameMap} from "../../hooks/game/useSetGameMap";
import {LoadingView} from "../LoadingView";

export const GameLocationSettings = ({setGameWikiId}) => {

    const {currentGame, loading: gameLoading} = useCurrentGame();
    const [selectedLocation, setSelectedLocation] = useState();
    const [clearPaint, setClearPaint] = useState();
    const [setFog, setSetFog] = useState();
    const {setGameMap} = useSetGameMap();

    if(gameLoading){
        return <LoadingView/>;
    }

    return <div>
        <div className={'margin-lg-top margin-lg-bottom'}>
            <h3>Current Location</h3>
            {currentGame.map ?
                <a onClick={async () => await setGameWikiId(currentGame.map._id)}>{currentGame.map.name}</a>
                :
                <p>No current location</p>
            }
        </div>
        {currentGame.canWrite &&
            <div className={'margin-lg-bottom'}>
                <h3>Change Location</h3>
                <SelectWiki types={[PLACE]} onChange={async (wiki) => {await setSelectedLocation(wiki._id)}}/>
                <div className={'margin-md'}>
                    Clear Paint: <Checkbox checked={clearPaint} onChange={async (e) => {
                    await setClearPaint(e.target.checked);
                }}/>
                </div>
                <div className={'margin-md'}>
                    Set Fog: <Checkbox checked={setFog} onChange={async (e) => {
                    await setSetFog(e.target.checked);
                }}/>
                </div>

                <div className={'margin-md'}>
                    <Button
                        onClick={
                            async() => {
                                await setGameMap({gameId: currentGame._id, placeId: selectedLocation, clearPaint, setFog});
                            }
                        }
                        disabled={!selectedLocation}
                    >Change location</Button>
                </div>
            </div>
        }
    </div>;
}