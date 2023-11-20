import React, { CSSProperties, ReactComponentElement, useState } from "react";
import useSearchWikiPages from "../../hooks/wiki/useSearchWikiPages";
import { useParams } from "react-router-dom";
import { WikiPage } from "../../types";
import PrimaryButton from "../widgets/PrimaryButton";
import DropdownSelect from "../widgets/DropdownSelect";
import SearchIcon from "../widgets/icons/SearchIcon";

interface SelectWikiProps<T extends WikiPage> {
	types?: string[];
	onChange?: (wiki: T) => void;
	style?: CSSProperties;
	showClear?: boolean;
	canAdmin?: boolean;
	children?: ReactComponentElement<never>[] | ReactComponentElement<never>;
	hasModel?: boolean;
}
export default function SelectWiki<T extends WikiPage>({
	types,
	onChange,
	style,
	showClear = false,
	canAdmin,
	children,
	hasModel,
}: SelectWikiProps<T>) {
	const params = useParams();
	const { refetch, wikis } = useSearchWikiPages({
		worldId: params.world_id,
		types,
		canAdmin,
		hasModel,
	});
	const [value, setValue] = useState<string>();

	const options = wikis
		? wikis.docs.map((wiki) => {
				return {
					label: wiki.name,
					value: wiki._id,
				};
		  })
		: [];

	const onSelect = async (newValue) => {
		await setValue(newValue);
		if (onChange) {
			for (const wiki of wikis.docs) {
				if (wiki._id === newValue) {
					await onChange(wiki as T);
				}
			}
		}
	};

	const kids = [];
	if (showClear) {
		kids.push(
			<PrimaryButton style={{ marginRight: "1em" }} onClick={async () => await onSelect(null)}>
				Clear
			</PrimaryButton>,
		);
	}
	if (children) {
		kids.push(...React.Children.toArray(children));
	}

	return (
		<>
			<DropdownSelect
				value={value}
				showArrow={false}
				onSearch={async (term) => {
					await refetch({
						worldId: params.world_id,
						types,
						name: term,
						canAdmin,
					});
				}}
				onChange={onSelect}
				helpText="Search for a wiki page"
				style={style ? style : { width: 200 }}
				icon={<SearchIcon />}
				options={options}
			/>
			{kids.length > 0 && <div style={{ display: "flex", marginTop: "1em" }}>{...kids}</div>}
		</>
	);
}
