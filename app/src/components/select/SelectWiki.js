import React, {useState} from 'react';
import {Select, Spin} from "antd";
import {useSearchWikiPages} from "../../hooks/useSearchWikiPages";
import {SearchOutlined} from "@ant-design/icons";

export const SelectWiki = ({type, onChange, style}) => {
	const {searchWikiPages, wikis, loading} = useSearchWikiPages();
	const [value, setValue] = useState();

	const options = wikis.map((wiki) => {return <Select.Option key={wiki._id} value={wiki._id}>{wiki.name}</Select.Option>});

	return <Select
		showSearch
		value={value}
		showArrow={false}
		filterOption={false}
		notFoundContent={loading ? <Spin size="small" /> : null}
		onSearch={async (term) => {await searchWikiPages(term, type)}}
		onSelect={async (newValue) => {
			await setValue(newValue);
			if(onChange){
				await onChange(newValue);
			}
		}}
		placeholder="Search for a wiki page"
		style={style ? style : { width: 200 }}
		suffixIcon={<SearchOutlined />}
	>
		{options}
	</Select>
};