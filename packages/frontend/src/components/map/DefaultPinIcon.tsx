import React from 'react';


export default function DefaultPinIcon({ size, color}: {size: number, color: string}) {
    return <div style={{
        borderRadius: '50%',
        border: '3px solid powderblue',
        backgroundColor: color,
        width: size + 'em',
        height: size + 'em'
    }}/>;
}