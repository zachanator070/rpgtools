import React from 'react';
import {Calendar} from "../../types.js";
import DropdownSelect from "../widgets/DropdownSelect.js";


export default function SelectAge({calendar, defaultAge, onChange}: {calendar: Calendar, defaultAge: number, onChange: (newValue: number) => any}) {
    return <DropdownSelect
        options={calendar.ages.map((age, index) => {
            return {
                value: index + 1,
                label: age.name
            };
        })}
        defaultValue={defaultAge > 0 ? {
            value: defaultAge,
            label: calendar.ages[defaultAge - 1].name
        } : {}}
        onChange={(value) => onChange(parseInt(value))}
    />;

}