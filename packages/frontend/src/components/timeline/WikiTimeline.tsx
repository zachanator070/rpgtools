import React from 'react';
import {Calendar} from "../../types";
import useWikisByCalendar from "../../hooks/wiki/useWikisByCalendar";
import LoadingView from "../LoadingView";


export default function WikiTimeline({calendar}: {calendar: Calendar}) {
    const {wikis, loading} = useWikisByCalendar({calendarId: calendar._id});

    if(loading) {
        return <LoadingView/>;
    }

    return <>
        {wikis.docs.map((wiki, index) => <div key={index}>wiki.name</div>)}
    </>;
}