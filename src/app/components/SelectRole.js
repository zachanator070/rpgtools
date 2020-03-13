import React, {useState} from 'react';
import {useSearchUsers} from "../hooks/useSearchUsers";
import {Select, Spin} from "antd";
import {useSearchRoles} from "../hooks/useSearchRoles";

export default ({onChange}) => {
	const {searchRoles, roles, loading} = useSearchRoles();
	const [value, setValue] = useState('');

	const options = roles.map((user) => {return <Select.Option key={user._id} value={user._id}>{user.username}</Select.Option>});

	return <Select
		showSearch
		value={value}
		filterOption={false}
		notFoundContent={loading ? <Spin size="small" /> : null}
		onSearch={async (term) => {await searchRoles(term)}}
		onChange={async (newValue) => {
			await setValue(newValue);
			if(onChange){
				await onChange(newValue);
			}
		}}
		placeholder="Search for a role"
		style={{ width: 200 }}
	>
		{options}
	</Select>
};