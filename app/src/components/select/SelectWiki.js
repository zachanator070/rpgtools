import React, {useEffect, useState} from 'react';
import {Select, Spin} from "antd";
import {useSearchWikiPages} from "../../hooks/useSearchWikiPages";
import useCurrentWorld from "../../hooks/useCurrentWorld";

export const SelectWiki = ({type, onChange}) => {
	const {currentWorld} = useCurrentWorld();
	const {searchWikiPages, wikis, loading} = useSearchWikiPages();
	const [value, setValue] = useState('');

	useEffect(() => {
		let found = false;
		for(let wiki of wikis){
			if(wiki._id === value){
				found = true;
			}
		}
		if(!found){
			(async () => {
				setValue('');
			})();
		}
	}, [wikis]);

	const options = wikis.map((wiki) => {return <Select.Option key={wiki._id} value={wiki._id}>{wiki.name}</Select.Option>});

	return <Select
		showSearch
		value={value}
		filterOption={false}
		notFoundContent={loading ? <Spin size="small" /> : null}
		onSearch={async (term) => {await searchWikiPages(term, type)}}
		onChange={async (newValue) => {
			await setValue(newValue);
			if(onChange){
				await onChange(newValue);
			}
		}}
		placeholder="Search for a wiki page"
		style={{ width: 200 }}
	>
		{options}
	</Select>
};