
import React, {useState} from 'react';
import {Select, Spin} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import {useSearchFolders} from "../../hooks/useSearchFolders";
import {useSearchModels} from "../../hooks/useSearchModels";

export const SelectModel = ({onChange, style}) => {
	const {searchModels, models, loading} = useSearchModels();
	const [value, setValue] = useState();

	const options = models.map((model) => {return <Select.Option key={model._id} value={model._id}>{model.name}</Select.Option>});

	return <Select
		showSearch
		value={value}
		showArrow={false}
		filterOption={false}
		notFoundContent={loading ? <Spin size="small" /> : null}
		onSearch={async (term) => {await searchModels(term)}}
		onSelect={async (newValue) => {
			await setValue(newValue);
			if(onChange){
				for(let model of models){
					if(model._id === newValue){
						await onChange(model);
						break;
					}
				}
			}
		}}
		placeholder="Search for a model"
		style={style ? style : { width: 200 }}
		suffixIcon={<SearchOutlined />}
	>
		{options}
	</Select>
};