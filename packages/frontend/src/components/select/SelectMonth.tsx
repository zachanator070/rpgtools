import React from "react";
import { Age } from "../../types";
import DropdownSelect from "../widgets/DropdownSelect";

export default function SelectMonth({
	age,
	onChange,
	defaultMonth,
}: {
	age: Age;
	onChange: (newValue: number) => void;
	defaultMonth: number;
}) {
	return (
		<DropdownSelect
			onChange={(newMonth) => onChange(parseInt(newMonth))}
			defaultValue={
				defaultMonth > 0
					? {
							value: defaultMonth,
							label: age.months[defaultMonth - 1].name,
					  }
					: {}
			}
			options={age.months.map((month, index) => {
				return {
					label: month.name,
					value: index + 1,
				};
			})}
		/>
	);
}
