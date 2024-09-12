import React, {CSSProperties, useState} from "react";
import useWorlds from "../../hooks/world/useWorlds.js";
import {World} from "../../types.js";
import DropdownSelect from "../widgets/DropdownSelect.tsx";
import PrimaryButton from "../widgets/PrimaryButton.tsx";
import SearchIcon from "../widgets/icons/SearchIcon.tsx";

interface SelectWorldProps {
	onChange?: (world: World) => any;
	style?: CSSProperties;
	showClear?: boolean;
}
export default function SelectWorld ({ onChange, style, showClear = false }: SelectWorldProps) {
	const { refetch, worlds } = useWorlds({});
	const [value, setValue] = useState();

	const options =
		worlds ?
		worlds.docs.map((world) => {
			return {
				label: world.name,
				value: world._id
			};
		}) : [];

	const onSelect = async (newValue) => {
		await setValue(newValue);
		if (onChange) {
			for (const world of worlds.docs) {
				if (world._id === newValue) {
					await onChange(world);
				}
			}
		}
	};

	return (
		<span>
			<DropdownSelect
				value={value}
				showArrow={false}
				onSearch={async (term) => {
					await refetch({ name: term });
				}}
				onChange={onSelect}
				helpText="Search for a world"
				style={style ? style : { width: 200 }}
				icon={<SearchIcon />}
				id={'searchWorld'}
				options={options}
			/>
			{showClear && (
				<span className={"margin-md-left"}>
					<PrimaryButton onClick={async () => await onSelect(null)}>Clear</PrimaryButton>
				</span>
			)}
		</span>
	);
};
