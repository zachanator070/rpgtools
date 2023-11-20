import { Select } from "antd";
import React from "react";

export default function MultiSelect({
	options,
	onChange,
	onSearch,
}: {
	options: { label: string; value: string }[];
	onChange: (selected: string[]) => void;
	onSearch?: (term) => void;
}) {
	return (
		<Select
			mode="multiple"
			allowClear
			style={{ width: "100%" }}
			placeholder="Please select"
			onChange={onChange}
			options={options}
			onSearch={onSearch}
		/>
	);
}
