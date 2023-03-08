import React, {useState} from 'react';
import SelectCalendar from "../select/SelectCalendar";
import WikiTimeline from "./WikiTimeline";

export default function TimelineView() {

    const [currentCalendar, setCurrentCalendar] = useState(null);

    return <div className={'margin-lg flex'} style={{flexDirection: 'column', alignItems: 'center'}}>
        <SelectCalendar onChange={async (calendar) => setCurrentCalendar(calendar)}/>
        {currentCalendar && <WikiTimeline calendar={currentCalendar}/> }
    </div>;
}