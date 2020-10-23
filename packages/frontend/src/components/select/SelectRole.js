import React, {useState} from 'react';
import {Select, Spin} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import {useSearchRoles} from "../../hooks/authorization/useSearchRoles";

export const SelectRole = ({onChange, style, canAdmin}) => {
	const {refetch, roles, loading} = useSearchRoles({canAdmin});
	const [value, setValue] = useState();

	const options = roles && roles.docs.map((role) => {return <Select.Option key={role._id} value={role._id}>{role.name}</Select.Option>});

	return <Select
		showSearch
		value={value}
		showArrow={false}
		filterOption={false}
		notFoundContent={loading ? <Spin size="small" /> : null}
		onSearch={async (term) => {await refetch({name: term, canAdmin})}}
		onSelect={async (newValue) => {
			await setValue(newValue);
			if(onChange){
				await onChange(newValue);
			}
		}}
		placeholder="Search for a role"
		style={style ? style : { width: 200 }}
		suffixIcon={<SearchOutlined />}
	>
		{options}
	</Select>
};