import React, {CSSProperties, useState} from "react";
import useSearchRoles from "../../hooks/authorization/useSearchRoles";
import DropdownOption from "../widgets/DropdownOption";
import DropdownSelect from "../widgets/DropdownSelect";
import SearchIcon from "../widgets/icons/SearchIcon";

interface SelectRoleProps {
	onChange: (roleId: string) => Promise<any>;
	style?: CSSProperties;
	canAdmin?: boolean;
}

export default function SelectRole({ onChange, style, canAdmin }: SelectRoleProps) {
	const { refetch, roles, loading } = useSearchRoles({ canAdmin });
	const [value, setValue] = useState<string>();

	const options =
		roles &&
		roles.docs.map((role) => {
			return (
				<DropdownOption key={role._id} value={role._id}>
					{role.name}
				</DropdownOption>
			);
		});

	return (
		<DropdownSelect
			value={value}
			onSearch={async (term) => {
				await refetch({ name: term, canAdmin });
			}}
			onChange={async (newValue) => {
				await setValue(newValue);
				if (onChange) {
					await onChange(newValue);
				}
			}}
			icon={<SearchIcon />}
			helpText={"Search for a model"}
			showArrow={false}
			style={style ? style : { width: 200 }}
			id={'selectRole'}
		>
			{options}
		</DropdownSelect>
	);
};
