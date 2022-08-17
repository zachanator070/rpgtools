import React, {useState} from "react";
import DiceAttribute from "./DiceAttribute";
import useCurrentCharacter from "../../hooks/game/useCurrentCharacter";
import LoadingView from "../LoadingView";
import DiceRoller from "./DiceRoller";
import ToolTip from "../widgets/ToolTip";
import useSetCharacterAttributes, {CharacterAttributeInput} from "../../hooks/game/useSetCharacterAttributes";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/InputForm";
import FormItem from "../widgets/FormItem";
import TextInput from "../widgets/TextInput";
import NumberInput from "../widgets/NumberInput";
import PrimaryButton from "../widgets/PrimaryButton";

export default function DiceOptions() {
	const { currentCharacter } = useCurrentCharacter();
	const [addAttributeVisible, setAddAttributeVisible] = useState<boolean>(false);
	const {setCharacterAttributes, loading} = useSetCharacterAttributes();
	if (!currentCharacter) {
		return <LoadingView />;
	}
	return (
		<div
			style={{
				overflow: "auto",
				height: "100%",
			}}
		>
			<FullScreenModal
				visible={addAttributeVisible}
				title={`Add New Attribute`}
				setVisible={setAddAttributeVisible}
			>
				<InputForm
					initialValues={{
						value: 0,
					}}
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
					<FormItem name={"name"} label={`Name`}>
						<TextInput style={{ width: "75px" }} />
					</FormItem>
					<FormItem name={"value"} label={`Value`}>
						<NumberInput style={{ width: "75px" }} />
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
