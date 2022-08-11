import React, {CSSProperties, useState} from "react";
import { Button, Select, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import useSearchModels from "../../hooks/model/useSearchModels";
import {Model} from "../../types";

interface SelectModelProps {
	onChange?: (model: Model) => Promise<any>;
	style?: CSSProperties;
	defaultModel?: Model;
	showClear?: boolean;
}

export default function SelectModel({
	onChange,
	style,
	defaultModel,
	showClear = true,
}: SelectModelProps) {
	const { searchModels, models, loading } = useSearchModels();
	const [value, setValue] = useState<string>();

	const options = models.map((model) => {
		return (
			<Select.Option key={model._id} value={model._id}>
				{model.name}
			</Select.Option>
		);
	});

	return (
		<div>
			<Select
				showSearch
				value={value}
				defaultValue={defaultModel && defaultModel._id}
				showArrow={false}
				filterOption={false}
				notFoundContent={loading ? <Spin size="small" /> : null}
				onSearch={async (term) => {
					await searchModels(term);
				}}
				onSelect={async (newValue) => {
					await setValue(newValue);
					if (onChange) {
						for (let model of models) {
							if (model._id === newValue) {
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
			{showClear && (
				<Button
					className={"margin-md-left"}
					onClick={async () => {
						await setValue(null);
						await onChange(null);
					}}
					danger={true}
				>
					Clear
				</Button>
			)}
		</div>
	);
};
