import React from 'react';
import {EventWiki} from "../../types.js";
import VerticalTimeline from "../widgets/VerticalTimeline.js";
import {Link, useParams} from "react-router-dom";
import {getDate, getTime} from "../wiki/view/WikiView.js";


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

export default function WikiTimeline({events}: {events: EventWiki[]}) {
    const {world_id} = useParams();
    const sortedEvents = [...events].sort(sortEvents)

    return <div style={{width: '100%'}} className={'margin-lg'}>
        <VerticalTimeline
            items={sortedEvents.map(wiki => {
                const event = wiki as EventWiki;
                return {
                    label: `${getDate(event)} ${getTime(event)}`,
                    children: <Link to={`/ui/world/${world_id}/wiki/${event._id}/view`}>{event.name}</Link>
                }
            })}
        />
    </div>;
}