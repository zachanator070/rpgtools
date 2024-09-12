import React, {useState} from 'react';
import TabCollection from "../../widgets/TabCollection.tsx";
import useCalendars from "../../../hooks/calendar/useCalendars.js";
import useUpsertCalendar from "../../../hooks/calendar/useUpsertCalendar.js";
import LoadingView from "../../LoadingView.tsx";
import {Age, Calendar, DayOfTheWeek, Month} from "../../../types.js";
import AgeEditor from "./AgeEditor.tsx";
import TextInput from "../../widgets/input/TextInput.tsx";
import PrimaryButton from "../../widgets/PrimaryButton.tsx";
import ToolTip from "../../widgets/ToolTip.tsx";
import QuestionMarkIcon from "../../widgets/icons/QuestionMarkIcon.tsx";

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

    return <div className={'margin-lg'}>
        <div>
            Name:
            <span className={'margin-md-left'}>
                <TextInput style={{width: '15rem'}} defaultValue={name} onChange={event => setName(event.target.value)}/>
            </span>
        </div>
        <div>
            <div className={'margin-md'}>
                <ToolTip title={'Press the + button to add a new age to this calendar'}>
                    <QuestionMarkIcon/>
                </ToolTip>
            </div>
            <TabCollection
                style={{marginBottom: '2em'}}
                onEdit={async (targetKey, action) => {
                    if(action === 'add') {
                        setAges([
                            ...ages,
                            {
                                _id: undefined,
                                name: 'New Age',
                                numYears: 1,
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
                            title: calendar.ages.at(index)?.name || 'New Age',
                            key: index,
                            children: <AgeEditor
                                editable={true}
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
        </div>
        <PrimaryButton onClick={async () => {
            await upsertCalendar({calendarId: calendar._id, name, ages});
        }}>
            Save
        </PrimaryButton>
    </div>;
}