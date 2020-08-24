import React, {useEffect, useState} from 'react';
import {Select, Spin} from "antd";
import {useSearchRoles} from "../../hooks/useSearchRoles";

export const SelectRole = ({onChange}) => {
	const {searchRoles, roles, loading} = useSearchRoles();
	const [value, setValue] = useState('');

	useEffect(() => {
		let found = false;
		for(let role of roles){
			if(role.name.includes(value)){
				found = true;
			}
		}
		if(!found){
			(async () => {
				setValue('');
			})();
		}
	}, [roles]);

	const options = roles.map((role) => {return <Select.Option key={role._id} value={role._id}>{role.name}</Select.Option>});

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