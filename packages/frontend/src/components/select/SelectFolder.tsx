import React, {CSSProperties, useState} from "react";
import { useParams } from "react-router-dom";
import useFolders from "../../hooks/wiki/useFolders";
import DropdownSelect from "../widgets/DropdownSelect";
import DropdownOption from "../widgets/DropdownOption";
import SearchIcon from "../widgets/icons/SearchIcon";

interface SelectFolderProps {
	onChange?: (folderId: string) => Promise<any>;
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

	const options =
		folders &&
		folders.map((folder) => {
			return (
				<DropdownOption key={folder._id} value={folder._id}>
					{folder.name}
				</DropdownOption>
			);
		});

	return (
		<DropdownSelect
			value={value}
			loading={loading}
			onSearch={async (term) => {
				await refetch({ worldId: params.world_id, name: term, canAdmin });
			}}
			onChange={async (newValue) => {
				await setValue(newValue);
				if (onChange) {
					await onChange(newValue);
				}
			}}
			style={style ? style : { width: 200 }}
			icon={<SearchIcon />}
			helpText={"Search for a model"}
			showArrow={false}
		>
			{options}
		</DropdownSelect>
	);
};
