import React, {useState} from "react";
import ToolTip from "../widgets/ToolTip";
import InputForm from "../widgets/InputForm";
import FormItem from "../widgets/FormItem";
import FileInput from "../widgets/FileInput";
import TextInput from "../widgets/TextInput";
import NumberInput from "../widgets/NumberInput";
import TextAreaInput from "../widgets/TextAreaInput";

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
	initialValues?: any;
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
		<InputForm initialValues={initialValues} onSubmit={(values) => callback({file: selectedFile, ...values})} loading={loading} errors={errors}>
			<FormItem
				label="Name"
				required={true}
			>
				<TextInput name="name"/>
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
				<NumberInput name="depth"/>
			</FormItem>
			<FormItem
				label={
					<div>
						<ToolTip title={"Width of the model in feet"}/> Width
					</div>
				}
				required={true}
			>
				<NumberInput name="width"/>
			</FormItem>
			<FormItem
				label={
					<div>
						<ToolTip title={"Height of the model in feet"}/> Height
					</div>
				}
				required={true}
			>
				<NumberInput name="height"/>
			</FormItem>
			<FormItem label={<div>Notes</div>} >
				<TextAreaInput name="notes" rows={15} cols={50} />
			</FormItem>
		</InputForm>
	);
};
