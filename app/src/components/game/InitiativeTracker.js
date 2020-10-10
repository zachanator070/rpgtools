import React, {useEffect, useState} from 'react';
import {InitiativeTrackerCard} from "./InitiativeTrackerCard";
import {InitiativeTrackerDummyCard} from "./InitiativeTrackerDummyCard";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import {useSetCharacterOrder} from "../../hooks/game/useSetCharacterOrder";
import {useGameRosterSubscription} from "../../hooks/game/useGameRosterSubscription";

export const InitiativeTracker = () => {

    const {currentGame} = useCurrentGame();
    const {setCharacterOrder} = useSetCharacterOrder();
    const {gameRosterChange} = useGameRosterSubscription();
    const [roster, setRoster] = useState();

    useEffect(() => {
        if(currentGame){
            setRoster(currentGame.characters);
        }
    }, [currentGame]);

    useEffect(() => {
        if(gameRosterChange){
            setRoster(gameRosterChange.characters);
        }
    }, [gameRosterChange]);

    const setData = async (characters) => {
        await setCharacterOrder({characters: characters.map(character => {
            return {name: character.name};
        })});
    }

    return <div
        style={{
            padding: '7px',
            position: 'absolute',
            top: 0,
            width: '100%',
            backgroundColo: 'white',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '60px'
        }}
    >
        <InitiativeTrackerDummyCard setData={setData} data={roster} side={'left'}/>
        {roster && roster.map(player => <InitiativeTrackerCard key={player.name} {...player} setData={setData} data={roster}/>)}
        <InitiativeTrackerDummyCard setData={setData} data={roster} side={'right'}/>
    </div>;
}