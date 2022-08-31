import React, {CSSProperties, useState} from "react";
import useSearchModels from "../../hooks/model/useSearchModels";
import {Model} from "../../types";
import DropdownSelect from "../widgets/DropdownSelect";
import DangerButton from "../widgets/DangerButton";

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
		return {
			value: model._id,
			label: model.name
		};
	});

	return (
		<div>
			<DropdownSelect
				value={value}
				defaultValue={defaultModel && defaultModel._id}
				onSearch={async (term) => {
					await searchModels(term);
				}}
				onChange={async (newValue) => {
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
				style={style ? style : { width: 200 }}
				helpText={"Search for a model"}
				showArrow={false}
				options={options}
			/>
			{showClear && (
				<DangerButton
					className={"margin-md-left"}
					onClick={async () => {
						await setValue(null);
						await onChange(null);
					}}
				>
					Clear
				</DangerButton>
			)}
		</div>
	);
};
