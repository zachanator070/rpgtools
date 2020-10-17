import React from 'react';
import {INITIATIVE_CARD} from "./DragAndDropConstants";
import {useDrop} from "react-dnd";

export const InitiativeTrackerDummyCard = ({side, data, setData}) => {

    const [dropProps, dropRef] = useDrop({
        accept: INITIATIVE_CARD,
        drop: (draggedItem, monitor) => {
            const newData = data.filter(oldItem => oldItem.name !== draggedItem.name);
            if(side === 'left'){
                setData([draggedItem, ...newData]);
            }
            else {
                setData([...newData, draggedItem]);
            }
        }
    });

    return <div
        style={{
            flex: '1 1',
            height: '100%'
        }}
        ref={dropRef}
    />
};