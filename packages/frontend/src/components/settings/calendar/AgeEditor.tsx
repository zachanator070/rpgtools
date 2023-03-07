import React, {useEffect, useState} from 'react';
import TextInput from "../../widgets/input/TextInput";
import NumberInput from "../../widgets/input/NumberInput";
import SecondaryDangerButton from "../../widgets/SecondaryDangerButton";
import SecondaryButton from "../../widgets/SecondaryButton";
import {Age} from "../../../types";

export default function AgeEditor({age, onChange}: {age: Age, onChange: (age: Age) => any}) {

    const [name, setName] = useState(age.name);
    const [numYears, setNumYears] = useState(age.numYears);
    const [months, setMonths] = useState(age.months);
    const [daysOfTheWeek, setDaysOfTheWeek] = useState(age.daysOfTheWeek);

    useEffect(() => {
        onChange({
            _id: age._id,
            name,
            numYears,
            months,
            daysOfTheWeek
        });
    }, [name, numYears, months, daysOfTheWeek]);

    return <div>
        <div>
            <div className={'margin-md-bottom'}>
                Age Name:
                <span className={'margin-md-left'}>
                    <TextInput style={{width: '15rem'}} defaultValue={name} onChange={(event) => setName(event.target.value)}/>
                </span>
            </div>
            <div className={'margin-md-bottom'}>
                Number of Years:
                <span className={'margin-md-left'}>
                    <NumberInput defaultValue={numYears} onChange={(value) => setNumYears(value)}/>
                </span>
            </div>
        </div>
        <h3>Months:</h3>
        <div className={'margin-md-left margin-md-bottom'}>
            {months.map((month, index) => <div key={index} className={'margin-md-left margin-md-bottom'}>
                <div className={'margin-md-bottom'}>
                    Month Name:
                    <span className={'margin-md-left'}>
                        <TextInput style={{width: '15rem'}} defaultValue={month.name} onChange={event => {
                            month.name = event.target.value;
                            setMonths([...months]);
                        }}/>
                    </span>
                </div>
                <div className={'margin-md-bottom'}>
                    Number of Days:
                    <span className={'margin-md-left'}>
                        <NumberInput defaultValue={month.numDays} onChange={value => {
                            month.numDays = value;
                            setMonths([...months]);
                        }}/>
                    </span>
                </div>
                <div className={'margin-md-bottom'}>
                    <SecondaryDangerButton
                        onClick={() => {
                            setMonths(months.filter(
                                (oldMonth, oldIndex) => oldIndex !== index
                            ));
                        }}
                    >
                        Delete Month {month.name}
                    </SecondaryDangerButton>
                </div>

            </div>)}
            <SecondaryButton
                onClick={() => {
                    setMonths([...months, {name: 'New Month', numDays: 0}]);
                }}
            >
                Add Month
            </SecondaryButton>
        </div>
        <h3>Days of the Week:</h3>
        <div className={'margin-md-left'}>
            {age.daysOfTheWeek.map((dayOfTheWeek, index) => <div key={index} className={'margin-md-left margin-md-bottom'}>
                <div className={'margin-md-bottom'}>
                    Day of the Week Name:
                    <span className={'margin-md-left'}>
                        <TextInput style={{width: '15rem'}} defaultValue={dayOfTheWeek.name} onChange={event => {
                            dayOfTheWeek.name = event.target.value;
                            setDaysOfTheWeek([...daysOfTheWeek]);
                        }}/>
                    </span>
                </div>
                <SecondaryDangerButton
                    onClick={() => {
                        setDaysOfTheWeek(daysOfTheWeek.filter(
                            (oldMonth, oldIndex) => oldIndex !== index
                        ));
                    }}
                >
                    Delete Day {dayOfTheWeek.name}
                </SecondaryDangerButton>
            </div>)}
            <SecondaryButton
                onClick={() => {
                    setDaysOfTheWeek([...daysOfTheWeek, {name: 'New Day of the Week'}]);
                }}
            >
                Add Day of the Week
            </SecondaryButton>
        </div>
    </div>;
}