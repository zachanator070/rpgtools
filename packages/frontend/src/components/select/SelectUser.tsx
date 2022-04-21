import React, {CSSProperties, useState} from "react";
import { Select, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSearchUsers } from "../../hooks/authentication/useSearchUsers";

interface SelectUserProps {
	onChange: (userId: string) => Promise<any>;
	style?: CSSProperties;
}

export const SelectUser = ({ onChange, style }: SelectUserProps) => {
	const { searchUsers, users, loading } = useSearchUsers();
	const [value, setValue] = useState<string>();

	let options = [];
	if(users){
		options = users.docs.map((user) => {
			return (
				<Select.Option key={user._id} value={user._id}>
					{user.username}
				</Select.Option>
			);
		});
	} 

	return (
		<Select
			showSearch
			value={value}
			showArrow={false}
			filterOption={false}
			notFoundContent={loading ? <Spin size="small" /> : null}
			onSearch={async (term) => {
				await searchUsers({username: term});
			}}
			onSelect={async (newValue) => {
				await setValue(newValue);
				if (onChange) {
					await onChange(newValue);
				}
			}}
			placeholder="Search for a user"
			style={style ? style : { width: 200 }}
			suffixIcon={<SearchOutlined />}
		>
			{options}
		</Select>
	);
};
