import React from 'react';
import {Calendar, EventWiki} from "../../types";
import useWikisByCalendar from "../../hooks/wiki/useWikisByCalendar";
import LoadingView from "../LoadingView";
import VerticalTimeline from "../widgets/VerticalTimeline";
import {Link, useParams} from "react-router-dom";
import {getDate, getTime} from "../wiki/WikiContent";


function sortEvents(eventA: EventWiki, eventB: EventWiki): number {
    if(eventA.age > eventB.age) {
        return 1;
    } else if(eventA.age < eventB.age) {
        return -1;
    }

    if(eventA.year > eventB.year) {
        return 1;
    } else if(eventA.year < eventB.year) {
        return -1;
    }

    if(eventA.month > eventB.month) {
        return 1;
    } else if(eventA.month < eventB.month) {
        return -1;
    }

    if(eventA.day > eventB.day) {
        return 1;
    } else if(eventA.day < eventB.day) {
        return -1;
    }

    if(eventA.hour > eventB.hour) {
        return 1;
    } else if(eventA.hour < eventB.hour) {
        return -1;
    }

    if(eventA.minute > eventB.minute) {
        return 1;
    } else if(eventA.minute < eventB.minute) {
        return -1;
    }

    if(eventA.second > eventB.second) {
        return 1;
    } else if(eventA.second < eventB.second) {
        return -1;
    }
}

export default function WikiTimeline({calendar}: {calendar: Calendar}) {
    const {world_id} = useParams();
    const {wikis, loading} = useWikisByCalendar({calendarId: calendar._id});

    if(loading) {
        return <LoadingView/>;
    }

    const sortedEvents = wikis.docs.sort(sortEvents)

    return <div style={{width: '100%'}}>
        <VerticalTimeline
            items={sortedEvents.map(wiki => {
                const event = wiki as EventWiki;
                return {
                    label: `${getDate(event)} ${getTime(event)}`,
                    children: <Link to={`/ui/world/${world_id}/wiki/${event._id}/view`}><a>{event.name}</a></Link>
                }
            })}
        />
    </div>;
}