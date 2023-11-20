import React from 'react';
import MultiSelect from "../widgets/MultiSelect";
import useCalendars from "../../hooks/calendar/useCalendars";
import LoadingView from "../LoadingView";


export default function SelectMultipleCalendars({onChange}: {onChange: (values: string[]) => any}) {
    const {calendars, loading} = useCalendars();
    if(loading) {
        return <LoadingView/>;
    }
    return <MultiSelect
        options={calendars.map(calendar => {return {label: calendar.name, value: calendar._id}})}
        onChange={onChange}
    />;
}