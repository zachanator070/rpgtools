import React, {useState} from "react";
import ToolTip from "../widgets/ToolTip.tsx";
import InputForm from "../widgets/input/InputForm.tsx";
import FormItem from "../widgets/input/FormItem.tsx";
import FileInput from "../widgets/input/FileInput.tsx";
import TextInput from "../widgets/input/TextInput.tsx";
import NumberInput from "../widgets/input/NumberInput.tsx";
import TextAreaInput from "../widgets/input/TextAreaInput.tsx";
import {Model} from "../../types.js";

interface CallbackValues {
	name: string;
	depth: string;
	width: string;
	height: string;
	notes: string;
	file: any;
}

interface ModelFormProps {
	callback: (values: CallbackValues) => Promise<any>;
	initialValues?: Model;
	loading: boolean;
	fileRequired?: boolean;
	errors: string[];
}

export default function ModelForm({
	callback,
	initialValues,
	loading,
	errors,
	fileRequired = true,
}: ModelFormProps) {

	const [selectedFile, setSelectedFile] = useState(null);

	return (
		<InputForm onSubmit={(values) => callback({file: selectedFile, ...values})} loading={loading} errors={errors}>
			<FormItem
				label="Name"
				required={true}
			>
				<TextInput defaultValue={initialValues && initialValues.name} name="name"/>
			</FormItem>
			<FormItem
				label={
					<div>
						<ToolTip
							title={
								<>
									Supported file types:
									<br />
									<ul>
										<li>.glb</li>
										<li>.stl</li>
										<li>.obj</li>
									</ul>
								</>
							}
						/>
						<span style={{marginLeft: ".5em"}}>
							File
						</span>
					</div>
				}
				validationRules={[
					async (value) => {
						// this function has to be async b/c the validator has to return a promise
						if (!value || value.length !== 1) {
							return;
						}
						const file = value[0];
						const supportedTypes = ["glb", "obj", "stl"];
						const parts = file.name.split(".");

						const type = parts.length > 0 ? parts[parts.length - 1] : null;
						if (!supportedTypes.includes(type)) {
							throw new Error(`File type ${type} not supported`);
						}
					}
				]}
				required={fileRequired}
			>
				<FileInput onChange={setSelectedFile}/>
			</FormItem>
			<FormItem
				label={
					<div>
						<ToolTip title={"Depth of the model in feet"}/> Depth
					</div>
				}
				required={true}
			>
				<NumberInput defaultValue={initialValues && initialValues.depth} name="depth"/>
			</FormItem>
			<FormItem
				label={
					<div>
						<ToolTip title={"Width of the model in feet"}/> Width
					</div>
				}
				required={true}
			>
				<NumberInput defaultValue={initialValues && initialValues.width} name="width"/>
			</FormItem>
			<FormItem
				label={
					<div>
						<ToolTip title={"Height of the model in feet"}/> Height
					</div>
				}
				required={true}
			>
				<NumberInput defaultValue={initialValues && initialValues.height} name="height"/>
			</FormItem>
			<FormItem label={<div>Notes</div>} >
				<TextAreaInput name="notes" defaultValue={initialValues && initialValues.notes} rows={15} cols={50} />
			</FormItem>
		</InputForm>
	);
};
