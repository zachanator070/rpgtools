import React from 'react';
import useCalendars from "../../../hooks/calendar/useCalendars.js";
import LoadingView from "../../LoadingView.js";
import useUpsertCalendar from "../../../hooks/calendar/useUpsertCalendar.js";
import CalendarItem from "./CalendarItem.js";
import PrimaryButton from "../../widgets/PrimaryButton.js";

export default function CalendarList() {
    const { calendars, loading: calendarsLoading } = useCalendars();
    const {upsertCalendar, loading: upsertLoading} = useUpsertCalendar();

    if(calendarsLoading || upsertLoading) {
        return <LoadingView/>;
    }

    return <div>
        <h2>Calendars</h2>
        {calendars.map((calendar, index) => <CalendarItem calendar={calendar} key={index}/>)}
        <PrimaryButton onClick={async () => await upsertCalendar({name: 'New Calendar', ages: []})}>
            Add Calendar
        </PrimaryButton>
    </div>;
}