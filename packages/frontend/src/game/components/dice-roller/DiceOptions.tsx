import React, {useState} from "react";
import DiceAttribute from "./DiceAttribute.js";
import useCurrentCharacter from "../../../hooks/game/useCurrentCharacter.js";
import DiceRoller from "./DiceRoller.js";
import useSetCharacterAttributes, {CharacterAttributeInput} from "../../../hooks/game/useSetCharacterAttributes.js";
import LoadingView from "../../../components/LoadingView.js";
import FullScreenModal from "../../../components/widgets/FullScreenModal.js";
import InputForm from "../../../components/widgets/input/InputForm.js";
import FormItem from "antd/es/form/FormItem";
import TextInput from "../../../components/widgets/input/TextInput.js";
import NumberInput from "../../../components/widgets/input/NumberInput.js";
import ToolTip from "../../../components/widgets/ToolTip.js";
import PrimaryButton from "../../../components/widgets/PrimaryButton.js";

export default function DiceOptions() {
	const { currentCharacter } = useCurrentCharacter();
	const [addAttributeVisible, setAddAttributeVisible] = useState<boolean>(false);
	const {setCharacterAttributes, loading, errors} = useSetCharacterAttributes();
	if (!currentCharacter) {
		return <LoadingView />;
	}
	return (
		<div className={'padding-lg-bottom'}>
			<FullScreenModal
				visible={addAttributeVisible}
				title={`Add New Attribute`}
				setVisible={setAddAttributeVisible}
			>
				<InputForm
					errors={errors}
					loading={loading}
					onSubmit={async ({ name, value }) => {
						const newAttribute: CharacterAttributeInput = {name, value: parseInt(value)};
						await setCharacterAttributes({
							attributes: [newAttribute, ...currentCharacter.attributes.map(oldAttribute => {
								return {_id: oldAttribute._id, name: oldAttribute.name, value: oldAttribute.value}
							})]
						});
						setAddAttributeVisible(false);
					}}
				>
					<FormItem label={`Name`}>
						<TextInput name={"name"}  style={{ width: "75px" }} />
					</FormItem>
					<FormItem label={`Value`}>
						<NumberInput defaultValue={0} name={"value"}  style={{ width: "75px" }} />
					</FormItem>
				</InputForm>
			</FullScreenModal>
			<div className={"margin-lg-bottom"}>
				<h2 style={{ display: "inline" }}>Attribute Checks</h2>
				<span className={"margin-lg-left"}>
					<ToolTip title={"Click on an attribute to roll a skill check"}/>
				</span>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-around",
					flexWrap: "wrap",
				}}
			>
				{currentCharacter.attributes.map(attribute => <DiceAttribute attribute={attribute} key={attribute._id}/>)}
			</div>
			<PrimaryButton onClick={() => setAddAttributeVisible(true)}>Add Attribute</PrimaryButton>
			<DiceRoller />
		</div>
	);
};
