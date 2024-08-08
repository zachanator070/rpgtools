import React, {useState} from "react";
import DiceAttribute from "./DiceAttribute";
import useCurrentCharacter from "../../../hooks/game/useCurrentCharacter";
import DiceRoller from "./DiceRoller";
import useSetCharacterAttributes, {CharacterAttributeInput} from "../../../hooks/game/useSetCharacterAttributes";
import LoadingView from "../../../components/LoadingView";
import FullScreenModal from "../../../components/widgets/FullScreenModal";
import InputForm from "../../../components/widgets/input/InputForm";
import FormItem from "antd/es/form/FormItem";
import TextInput from "../../../components/widgets/input/TextInput";
import NumberInput from "../../../components/widgets/input/NumberInput";
import ToolTip from "../../../components/widgets/ToolTip";
import PrimaryButton from "../../../components/widgets/PrimaryButton";

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