import React, {useState} from 'react';
import {Select, Spin} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import {useSearchFolders} from "../../hooks/wiki/useSearchFolders";

export const SelectFolder = ({onChange, style}) => {
	const {searchFolders, folders, loading} = useSearchFolders();
	const [value, setValue] = useState();

	const options = folders.map((folder) => {return <Select.Option key={folder._id} value={folder._id}>{folder.name}</Select.Option>});

	return <Select
		showSearch
		value={value}
		showArrow={false}
		filterOption={false}
		notFoundContent={loading ? <Spin size="small" /> : null}
		onSearch={async (term) => {await searchFolders(term)}}
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