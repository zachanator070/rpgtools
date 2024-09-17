import React from 'react';
import {Calendar} from "../../../types";
import FullScreenModal from "../../widgets/FullScreenModal";
import useUpsertCalendar from "../../../hooks/calendar/useUpsertCalendar";
import CalendarEditor from "./CalendarEditor";

export default function EditCalendarModal({calendar, visible, setVisible}: {calendar: Calendar, visible: boolean, setVisible: (visible: boolean) => any}) {
    const {loading: upsertLoading} = useUpsertCalendar();
    return <FullScreenModal title={'Edit Calendar'} visible={visible} setVisible={setVisible} closable={!upsertLoading}>
        <CalendarEditor calendar={calendar}/>
    </FullScreenModal>;
}