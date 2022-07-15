import React, { useState } from "react";
import { Button, Select, Spin } from "antd";
import useSearchWikiPages from "../../hooks/wiki/useSearchWikiPages";
import { SearchOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import {WikiPage} from "../../types";

interface SelectWikiProps <T extends WikiPage>{
	types?: string[];
	onChange?: (wiki: T) => Promise<void>;
	style?: any;
	showClear?: boolean;
	canAdmin?: boolean;
}
export default function SelectWiki<T extends WikiPage>({
	types,
	onChange,
	style,
	showClear = false,
	canAdmin,
}: SelectWikiProps<T>) {
	const params = useParams();
	const { refetch, wikis, loading } = useSearchWikiPages({
		worldId: params.world_id,
		types,
		canAdmin,
	});
	const [value, setValue] = useState<string>();

	const options =
		wikis &&
		wikis.docs.map((wiki) => {
			return (
				<Select.Option key={wiki._id} value={wiki._id}>
					{wiki.name}
				</Select.Option>
			);
		});

	const onSelect = async (newValue) => {
		await setValue(newValue);
		if (onChange) {
			for (let wiki of wikis.docs) {
				if (wiki._id === newValue) {
					await onChange(wiki as T);
				}
			}
		}
	};

	return (
		<span>
			<Select
				showSearch
				value={value}
				showArrow={false}
				filterOption={false}
				notFoundContent={loading ? <Spin size="small" /> : null}
				onSearch={async (term) => {
					await refetch({
						worldId: params.world_id,
						types,
						name: term,
						canAdmin,
					});
				}}
				onSelect={onSelect}
				placeholder="Search for a wiki page"
				style={style ? style : { width: 200 }}
				suffixIcon={<SearchOutlined />}
			>
				{options}
			</Select>
			{showClear && (
				<span className={"margin-md-left"}>
					<Button onClick={async () => await onSelect(null)}>Clear</Button>
				</span>
			)}
		</span>
	);
};
