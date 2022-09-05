import React, {CSSProperties, useState} from "react";
import useSearchUsers from "../../hooks/authentication/useSearchUsers";
import DropdownSelect from "../widgets/DropdownSelect";
import SearchIcon from "../widgets/icons/SearchIcon";

interface SelectUserProps {
	onChange: (userId: string) => Promise<any>;
	style?: CSSProperties;
}

export default function SelectUser({ onChange, style }: SelectUserProps) {
	const { searchUsers, users, loading } = useSearchUsers();
	const [value, setValue] = useState<string>();

	let options = [];
	if(users){
		options = users.docs.map((user) => {
			return {
				value: user._id,
				label: user.username
			};
		});
	} 

	return (
		<DropdownSelect
			id={'selectUserInput'}
			value={value}
			showArrow={false}
			onSearch={async (term) => {
				await searchUsers({username: term});
			}}
			onChange={async (newValue) => {
				await setValue(newValue);
				if (onChange) {
					await onChange(newValue);
				}
			}}
			helpText="Search for a user"
			style={style ? style : { width: 200 }}
			icon={<SearchIcon />}
			options={options}
		/>
	);
};
