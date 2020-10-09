import React, {useState} from 'react';
import {InitiativeTrackerCard} from "./InitiativeTrackerCard";
import {InitiativeTrackerDummyCard} from "./InitiativeTrackerDummyCard";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import {useSetCharacterOrder} from "../../hooks/game/useSetCharacterOrder";
import {useGameRosterSubscription} from "../../hooks/game/useGameRosterSubscription";

export const InitiativeTracker = () => {

    const {currentGame} = useCurrentGame();
    const {setCharacterOrder} = useSetCharacterOrder();
    const {gameRosterChange} = useGameRosterSubscription();

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
        <InitiativeTrackerDummyCard setData={setData} data={currentGame.characters} side={'left'}/>
        {currentGame.characters.map(player => <InitiativeTrackerCard key={player.name} {...player} setData={setData} data={currentGame.characters}/>)}
        <InitiativeTrackerDummyCard setData={setData} data={currentGame.characters} side={'right'}/>
    </div>;
}