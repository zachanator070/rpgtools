import React from 'react';


export default function InlineMargin({size, children}: {size: number, children: React.ReactNode}) {
    return <span style={{marginRight: `${size}em`, marginLeft: `${size}em`}}>{children}</span>
}