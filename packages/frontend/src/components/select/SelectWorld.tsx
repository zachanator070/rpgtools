import React, {CSSProperties, useState} from "react";
import useWorlds from "../../hooks/world/useWorlds";
import {World} from "../../types";
import DropdownSelect from "../widgets/DropdownSelect";
import DropdownOption from "../widgets/DropdownOption";
import PrimaryButton from "../widgets/PrimaryButton";
import SearchIcon from "../widgets/icons/SearchIcon";

interface SelectWorldProps {
	onChange?: (world: World) => Promise<any>;
	style?: CSSProperties;
	showClear?: boolean;
}
export default function SelectWorld ({ onChange, style, showClear = false }: SelectWorldProps) {
	const { refetch, worlds } = useWorlds({});
	const [value, setValue] = useState();

	const options =
		worlds &&
		worlds.docs.map((world) => {
			return (
				<DropdownOption key={world._id} value={world._id}>
					{world.name}
				</DropdownOption>
			);
		});

	const onSelect = async (newValue) => {
		await setValue(newValue);
		if (onChange) {
			for (let world of worlds.docs) {
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
			>
				{options}
			</DropdownSelect>
			{showClear && (
				<span className={"margin-md-left"}>
					<PrimaryButton onClick={async () => await onSelect(null)}>Clear</PrimaryButton>
				</span>
			)}
		</span>
	);
};
