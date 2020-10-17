import React, {useState} from 'react';
import {Button, Select, Spin} from "antd";
import {useSearchWikiPages} from "../../hooks/wiki/useSearchWikiPages";
import {SearchOutlined} from "@ant-design/icons";

export const SelectWiki = ({types, onChange, style, filter, showClear=false}) => {
	const {searchWikiPages, wikis, loading} = useSearchWikiPages();
	const [value, setValue] = useState();

	let potentialWikis = wikis;
	if(filter){
		potentialWikis = wikis.filter(filter);
	}

	const options = potentialWikis.map((wiki) => {return <Select.Option key={wiki._id} value={wiki._id}>{wiki.name}</Select.Option>});

	const onSelect = async (newValue) => {
		await setValue(newValue);
		if(onChange){
			for(let wiki of potentialWikis){
				if(wiki._id === newValue){
					await onChange(wiki);
				}
			}
		}
	};

	return <span>

		<Select
			showSearch
			value={value}
			showArrow={false}
			filterOption={false}
			notFoundContent={loading ? <Spin size="small" /> : null}
			onSearch={async (term) => {await searchWikiPages(term, types)}}
			onSelect={onSelect}
			placeholder="Search for a wiki page"
			style={style ? style : { width: 200 }}
			suffixIcon={<SearchOutlined />}
		>
			{options}
		</Select>
		{showClear &&
			<span className={'margin-md-left'}>
				<Button onClick={async () => await onSelect(null)}>Clear</Button>
			</span>
		}
	</span>;
};