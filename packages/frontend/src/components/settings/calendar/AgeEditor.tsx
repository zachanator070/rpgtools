import React, {useEffect, useState} from 'react';
import TextInput from "../../widgets/input/TextInput.js";
import NumberInput from "../../widgets/input/NumberInput.js";
import {Age} from "../../../types.js";
import PrimaryDangerButton from "../../widgets/PrimaryDangerButton.js";
import DeleteIcon from "../../widgets/icons/DeleteIcon.js";
import AddIcon from "../../widgets/icons/AddIcon.js";

export default function AgeEditor({age, onChange = () => {}, editable}: {age: Age, onChange?: (age: Age) => any, editable: boolean}) {

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
                    {editable ?
                        <TextInput style={{width: '15rem'}} defaultValue={name} onChange={(event) => setName(event.target.value)}/>
                        :
                        name
                    }
                </span>
            </div>
            <div className={'margin-md-bottom'}>
                Number of Years:
                <span className={'margin-md-left'}>
                    {editable ?
                        <NumberInput defaultValue={numYears} onChange={(value) => setNumYears(value)} minValue={1}/>
                        :
                        numYears
                    }
                </span>
            </div>
        </div>
        <h3>Months</h3>
        <div className={'margin-md-left margin-md-bottom grid-3'}>
            <div>
                Name
            </div>
            <div>
                # of Days
            </div>
            <div></div>
            {...months.map((month, index) => [
                <div key={`name${index}`}>
                    {editable ?
                        <TextInput style={{width: '15rem'}} defaultValue={month.name} onChange={event => {
                            month.name = event.target.value;
                            setMonths([...months]);
                        }}/>
                    :
                        month.name
                    }
                </div>,
                <div key={`numDays${index}`}>
                    {editable ?
                        <NumberInput
                            defaultValue={month.numDays}
                            onChange={value => {
                                month.numDays = value;
                                setMonths([...months]);
                            }}
                            minValue={1}
                        />
                    :
                        month.numDays
                    }
                </div>,
                <div key={`delete${index}`}>
                    {editable &&
                        <PrimaryDangerButton
                            onClick={() => {
                                setMonths(months.filter(
                                    (oldMonth, oldIndex) => oldIndex !== index
                                ));
                            }}
                        >
                            <DeleteIcon/>
                        </PrimaryDangerButton>
                    }
                </div>

            ]).flat()}
            {editable &&
                <a
                    onClick={() => {
                        setMonths([...months, {name: 'New Month', numDays: 1}]);
                    }}
                >
                    <AddIcon/>
                </a>
            }
        </div>
        <h3>Days of the Week</h3>
        <div className={'margin-md-left grid-2'}>
            <div>Name</div>
            <div></div>
            {age.daysOfTheWeek.map((dayOfTheWeek, index) => [
                <div key={`name${index}`}>
                    {editable?
                        <TextInput style={{width: '15rem'}} defaultValue={dayOfTheWeek.name} onChange={event => {
                            dayOfTheWeek.name = event.target.value;
                            setDaysOfTheWeek([...daysOfTheWeek]);
                        }}/>
                    :
                        dayOfTheWeek.name
                    }
                </div>,
                <div key={`delete${index}`}>
                    {editable ?
                        <PrimaryDangerButton
                            onClick={() => {
                                setDaysOfTheWeek(daysOfTheWeek.filter(
                                    (oldMonth, oldIndex) => oldIndex !== index
                                ));
                            }}
                        >
                            <DeleteIcon/>
                        </PrimaryDangerButton>
                        :
                        <div/>
                    }
                </div>
            ])}
            {editable &&
                <a
                    onClick={() => {
                        setDaysOfTheWeek([...daysOfTheWeek, {name: 'New Day of the Week'}]);
                    }}
                >
                    <AddIcon/>
                </a>
            }
        </div>
    </div>;
}