import React, {useState} from 'react';
import TabCollection from "../../widgets/TabCollection";
import useCalendars from "../../../hooks/calendar/useCalendars";
import useUpsertCalendar from "../../../hooks/calendar/useUpsertCalendar";
import LoadingView from "../../LoadingView";
import {Age, Calendar, DayOfTheWeek, Month} from "../../../types";
import AgeEditor from "./AgeEditor";
import TextInput from "../../widgets/input/TextInput";
import PrimaryButton from "../../widgets/PrimaryButton";

function filterAge(age: Age): Age {
    return {
        _id: age._id,
        name: age.name,
        numYears: age.numYears,
        months: age.months.map(filterMonth),
        daysOfTheWeek: age.daysOfTheWeek.map(filterDay)
    };
}

function filterMonth(month: Month): Month {
    return {
        _id: month._id,
        name: month.name,
        numDays: month.numDays
    };
}

function filterDay(day: DayOfTheWeek): DayOfTheWeek {
    return {
        _id: day._id,
        name: day.name
    };
}

export default function CalendarEditor({calendar}: {calendar: Calendar}) {

    const {loading: calendarsLoading } = useCalendars();
    const {upsertCalendar, loading: upsertLoading} = useUpsertCalendar();
    const [name, setName] = useState(calendar.name);
    // need to create objects without the __typename property that apollo adds, otherwise passing same object to upsertCalendar throws errors
    const [ages, setAges] = useState(calendar.ages.map(filterAge));

    if(calendarsLoading || upsertLoading) {
        return <LoadingView/>;
    }

    return <div>
        <div>
            Name:
            <span className={'margin-md-left'}>
                <TextInput style={{width: '15rem'}} defaultValue={name} onChange={event => setName(event.target.value)}/>
            </span>
        </div>
        <TabCollection
            style={{marginTop: '2em', marginBottom: '2em'}}
            onEdit={async (targetKey, action) => {
                if(action === 'add') {
                    setAges([
                        ...calendar.ages,
                        {
                            _id: undefined,
                            name: 'New Age',
                            numYears: 0,
                            months: [],
                            daysOfTheWeek: [],
                        }
                    ])
                } else {
                    setAges(ages.filter((age, index) => index !== parseInt(targetKey.toString())));
                }
            }}
            tabs={[
                ...ages.map((age, index) => {
                    return {
                        title: age.name,
                        children: <AgeEditor
                            age={age}
                            onChange={(age) => setAges([
                                ...ages.slice(0, index),
                                age,
                                ...ages.slice(index + 1)
                            ])}
                        />
                    }
                })
            ]}
        />
        <PrimaryButton onClick={async () => await upsertCalendar({calendarId: calendar._id, name, ages})}>
            Save
        </PrimaryButton>
    </div>;
}