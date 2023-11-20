import React, {useState} from 'react';
import WikiTimeline from "./WikiTimeline";
import SelectMultipleCalendars from "../select/SelectMultipleCalendars";
import useSearchEvents from "../../hooks/wiki/useSearchEvents";
import LoadingView from "../LoadingView";
import SelectMultipleWikis from "../select/SelectMultipleWikis";

export default function TimelineView() {

    const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
    const [selectedRelatedWikis, setRelatedWikis] = useState<string[]>([]);

    const {events, loading} = useSearchEvents({calendarIds: selectedCalendars, relatedWikiIds: selectedRelatedWikis})

    return <div className={'margin-lg flex'} style={{flexDirection: 'column', alignItems: 'center'}}>
        Event Filters
        <div className={'flex'} style={{width: '100%'}}>
            <div className={'flex'} style={{flexGrow: 1}}></div>
            <div className={'flex'} style={{flexGrow: 1, alignItems: 'center'}}>
                <div className={'margin-md'}>
                    Calendars:
                </div>
                <SelectMultipleCalendars onChange={(calendarIds) => setSelectedCalendars(calendarIds)}/>
            </div>
            <div className={'flex'} style={{flexGrow: 1}}></div>
        </div>
        <div className={'flex'} style={{width: '100%'}}>
            <div className={'flex'} style={{flexGrow: 1}}></div>
            <div className={'flex'} style={{flexGrow: 1, alignItems: 'center'}}>
                <div className={'margin-md'}>
                    Related Wikis:
                </div>
                <SelectMultipleWikis onChange={(wikiIds) => setRelatedWikis(wikiIds)} />
            </div>
            <div className={'flex'} style={{flexGrow: 1}}></div>
        </div>
        {loading ?
            <LoadingView/> :
            <WikiTimeline events={events.docs}/>
        }
    </div>;
}