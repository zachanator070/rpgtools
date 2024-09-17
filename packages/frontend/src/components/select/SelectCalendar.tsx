import React, {CSSProperties, useState} from 'react';
import useCalendars from "../../hooks/calendar/useCalendars";
import DropdownSelect from "../widgets/DropdownSelect";
import {Calendar} from "../../types";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton";

interface SelectCalendarProps {
    onChange?: (calendar: Calendar) => Promise<any>;
    style?: CSSProperties;
    defaultCalendar?: string;
    showClear?: boolean;
}

export default function SelectCalendar({onChange, style, defaultCalendar, showClear}: SelectCalendarProps) {
    const {calendars, loading} = useCalendars();
    const [value, setValue] = useState<string>();

    const options =
        calendars ?
            calendars.map((calendar) => {
                return {
                    label: calendar.name,
                    value: calendar._id
                };
            })
        : [];

    return <div>
        <DropdownSelect
            value={value}
            defaultValue={defaultCalendar}
            onChange={async (newValue) => {
                await setValue(newValue);
                if (onChange) {
                    for (let calendar of calendars) {
                        if (calendar._id === newValue) {
                            await onChange(calendar);
                            break;
                        }
                    }
                }
            }}
            style={style ? style : { width: 200 }}
            helpText={"Select a calendar"}
            showArrow={false}
            options={options}
        />
        {showClear && (
            <PrimaryDangerButton
                className={"margin-md-left"}
                onClick={async () => {
                    await setValue(null);
                    await onChange(null);
                }}
            >
                Clear
            </PrimaryDangerButton>
        )}
    </div>;


}