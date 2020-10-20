import React, {useState} from 'react';
import {Select, Spin} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import {useSearchUsers} from "../../hooks/authentication/useSearchUsers";

export const SelectUser = ({onChange, style}) => {
	const {searchUsers, users, loading} = useSearchUsers();
	const [value, setValue] = useState();

	const options = users.map((user) => {return <Select.Option key={user._id} value={user._id}>{user.username}</Select.Option>});

	return <Select
		showSearch
		value={value}
		showArrow={false}
		filterOption={false}
		notFoundContent={loading ? <Spin size="small" /> : null}
		onSearch={async (term) => {await searchUsers(term)}}
		onSelect={async (newValue) => {
			await setValue(newValue);
			if(onChange){
				await onChange(newValue);
			}
		}}
		placeholder="Search for a user"
		style={style ? style : { width: 200 }}
		suffixIcon={<SearchOutlined />}
	>
		{options}
	</Select>
};