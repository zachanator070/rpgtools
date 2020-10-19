import React, {useState} from 'react';
import {Select, Spin} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import {useParams} from 'react-router-dom';
import {useFolders} from "../../hooks/wiki/useFolders";

export const SelectFolder = ({onChange, style}) => {
	const params = useParams();
	const {refetch, folders, loading} = useFolders({worldId: params.world_id});
	const [value, setValue] = useState();

	const options = folders && folders.map((folder) => {return <Select.Option key={folder._id} value={folder._id}>{folder.name}</Select.Option>});

	return <Select
		showSearch
		value={value}
		showArrow={false}
		filterOption={false}
		notFoundContent={loading ? <Spin size="small" /> : null}
		onSearch={async (term) => {await refetch({worldId: params.world_id, name: term})}}
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