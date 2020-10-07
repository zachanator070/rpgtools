import React, {useState} from 'react';
import {InitiativeTrackerCard} from "./InitiativeTrackerCard";
import {InitiativeTrackerDummyCard} from "./InitiativeTrackerDummyCard";

export const InitiativeTracker = () => {

    const genColor = () => '#' + Math.floor(Math.random()*16777215).toString(16);

    const [data, setData] = useState(
        [
            {
                name: 'zach',
                color: genColor()
            },
            {
                name: 'breyton',
                color: genColor()
            },
            {
                name: 'parker',
                color: genColor()
            },
            {
                name: 'alyssum',
                color: genColor()
            },
        ]
    );

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
        <InitiativeTrackerDummyCard setData={setData} data={data} side={'left'}/>
        {data.map(player => <InitiativeTrackerCard {...player} setData={setData} data={data}/>)}
        <InitiativeTrackerDummyCard setData={setData} data={data} side={'right'}/>
    </div>;
}