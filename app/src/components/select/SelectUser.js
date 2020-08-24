import React, {useEffect, useState} from 'react';
import {useSearchUsers} from "../../hooks/useSearchUsers";
import {Select, Spin} from "antd";

export const SelectUser = ({onChange}) => {
	const {searchUsers, users, loading} = useSearchUsers();
	const [value, setValue] = useState('');

	useEffect(() => {
		let found = false;
		for(let user of users){
			if(user.username.includes(value)){
				found = true;
			}
		}
		if(!found){
			(async () => {
				setValue('');
			})();
		}
	}, [users]);

	const options = users.map((user) => {return <Select.Option key={user._id} value={user._id}>{user.username}</Select.Option>});

	return <Select
		showSearch
		value={value}
		filterOption={false}
		notFoundContent={loading ? <Spin size="small" /> : null}
		onSearch={async (term) => {await searchUsers(term)}}
		onChange={async (newValue) => {
			await setValue(newValue);
			if(onChange){
				await onChange(newValue);
			}
		}}
		placeholder="Search for a user"
		style={{ width: 200 }}
	>
		{options}
	</Select>
};