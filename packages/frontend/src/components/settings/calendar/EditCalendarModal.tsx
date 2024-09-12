import React from 'react';
import {Calendar} from "../../../types.js";
import FullScreenModal from "../../widgets/FullScreenModal.tsx";
import useUpsertCalendar from "../../../hooks/calendar/useUpsertCalendar.js";
import CalendarEditor from "./CalendarEditor.tsx";

export default function EditCalendarModal({calendar, visible, setVisible}: {calendar: Calendar, visible: boolean, setVisible: (visible: boolean) => any}) {
    const {loading: upsertLoading} = useUpsertCalendar();
    return <FullScreenModal title={'Edit Calendar'} visible={visible} setVisible={setVisible} closable={!upsertLoading}>
        <CalendarEditor calendar={calendar}/>
    </FullScreenModal>;
}