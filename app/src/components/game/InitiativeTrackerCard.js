import React from 'react';
import {useDrag, useDrop} from "react-dnd";
import {INITIATIVE_CARD} from "./DragAndDropConstants";

export const InitiativeTrackerCard = ({name, color, data, setData}) => {

    const [props, dragRef] = useDrag({
        item: {
            type: INITIATIVE_CARD,
            name,
            color
        }
    });

    const [dropProps, dropRef] = useDrop({
        accept: INITIATIVE_CARD,
        canDrop: (item, monitor) => item.name !== name,
        drop: (draggedItem, monitor) => {
            const newData = [];
            for(let oldItem of data.filter(oldItem => oldItem.name !== draggedItem.name)){
                if(oldItem.name === name){
                    newData.push(draggedItem);
                }
                newData.push(oldItem);
            }
            setData([...newData]);
        }
    });

    return <div
        style={{
            backgroundColor: 'white',
            fontWeight: '600',
            borderRadius: '5px',
            padding: '5px 8px',
            margin: '5px',
            color
        }}
        ref={(element) => {
            dropRef(element);
            dragRef(element);
        }}
    >
        {name}
    </div>;

};