import React, {useState} from 'react';
import TabCollection from "../../widgets/TabCollection";
import useCalendars from "../../../hooks/calendar/useCalendars";
import useUpsertCalendar from "../../../hooks/calendar/useUpsertCalendar";
import LoadingView from "../../LoadingView";
import {Age, Calendar, DayOfTheWeek, Month} from "../../../types";
import AgeEditor from "./AgeEditor";
import TextInput from "../../widgets/input/TextInput";
import PrimaryButton from "../../widgets/PrimaryButton";
import ToolTip from "../../widgets/ToolTip";
import QuestionMarkIcon from "../../widgets/icons/QuestionMarkIcon";

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
        <div style={{display: 'flex'}} className={'margin-md-top'}>
            <ToolTip title={'Press the + button to add a new age to this calendar'} className={'margin-md-top margin-md-right'}>
                <QuestionMarkIcon/>
            </ToolTip>
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
                            title: `Age ${index + 1}`,
                            key: index,
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
        </div>
        <PrimaryButton onClick={async () => {
            await upsertCalendar({calendarId: calendar._id, name, ages});
        }}>
            Save
        </PrimaryButton>
    </div>;
}