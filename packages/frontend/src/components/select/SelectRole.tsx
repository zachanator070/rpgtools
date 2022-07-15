import React, {CSSProperties, useState} from "react";
import { Select, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import useSearchRoles from "../../hooks/authorization/useSearchRoles";

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
				<Select.Option key={role._id} value={role._id}>
					{role.name}
				</Select.Option>
			);
		});

	return (
		<Select
			showSearch
			value={value}
			showArrow={false}
			filterOption={false}
			notFoundContent={loading ? <Spin size="small" /> : null}
			onSearch={async (term) => {
				await refetch({ name: term, canAdmin });
			}}
			onSelect={async (newValue) => {
				await setValue(newValue);
				if (onChange) {
					await onChange(newValue);
				}
			}}
			placeholder="Search for a role"
			style={style ? style : { width: 200 }}
			suffixIcon={<SearchOutlined />}
			id={'selectRole'}
		>
			{options}
		</Select>
	);
};
