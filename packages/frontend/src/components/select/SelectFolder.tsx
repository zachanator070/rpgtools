import React, {CSSProperties, useState} from "react";
import { useParams } from "react-router-dom";
import useFolders from "../../hooks/wiki/useFolders";
import DropdownSelect from "../widgets/DropdownSelect";
import SearchIcon from "../widgets/icons/SearchIcon";
import {WikiFolder} from "../../types";

interface SelectFolderProps {
	onChange?: (folder: WikiFolder) => any;
	style?: CSSProperties;
	canAdmin?: boolean;
}
export default function SelectFolder({ onChange, style, canAdmin }: SelectFolderProps) {
	const params = useParams();
	const { refetch, folders, loading } = useFolders({
		worldId: params.world_id,
		canAdmin,
	});
	const [value, setValue] = useState<string>();

	const onSelect = async (newValue) => {
		await setValue(newValue);
		if (onChange) {
			for (let folder of folders) {
				if (folder._id === newValue) {
					await onChange(folder);
				}
			}
		}
	};

	const options =
		folders ?
		folders.map((folder) => {
			return {
				label: folder.name,
				value: folder._id
			};
		}) : [];

	return (
		<DropdownSelect
			value={value}
			loading={loading}
			onSearch={async (term) => {
				await refetch({ worldId: params.world_id, name: term, canAdmin });
			}}
			onChange={onSelect}
			style={style ? style : { width: 200 }}
			icon={<SearchIcon />}
			helpText={"Search for a model"}
			showArrow={false}
			options={options}
		/>
	);
};
