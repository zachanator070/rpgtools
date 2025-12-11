import React, { useEffect, useState } from "react";
import useAddModel from "../../../hooks/game/useAddModel";
import useCurrentGame from "../../../hooks/game/useCurrentGame";
import { MODELED_WIKI_TYPES } from "@rpgtools/common/src/type-constants";
import {ModeledWiki} from "../../../types";
import SelectWiki from "../../../components/select/SelectWiki";
import SelectModel from "../../../components/select/SelectModel";
import ModelViewer from "../../../components/models/ModelViewer";
import PrimaryButton from "../../../components/widgets/PrimaryButton";
import RadioButtonGroup from "../../../components/widgets/RadioButtonGroup";
import RadioButton from "../../../components/widgets/RadioButton";
import ManageTokenIcons from "../../../components/select/ManageTokenIcons";
import ColorInput from "../../../components/widgets/input/ColorInput";

interface TokenIcon {
	_id: string;
	image: {
		_id: string;
	};
	world: {
		_id: string;
	};
}

interface SelectedModel {
	model: any;
	wiki?: any;
}

export default function AddModelSection() {
	const [selectedModel, setSelectedModel] = useState<SelectedModel>(null);
	const { currentGame } = useCurrentGame();
	const { addModel } = useAddModel();
	const [modelColor, setModelColor] = useState<string>();
	const [selectedTokenIcon, setSelectedTokenIcon] = useState<TokenIcon>(null);
	const [selectedTokenType, setSelectedTokenType] = useState<string>("CIRCLE");
	const [createTokenModalVisible, setCreateTokenModalVisible] = useState(false);

	const [addMode, setAddMode] = useState<"wiki" | "model" | "token">("wiki");

	const [modelViewerContainer, setModelViewerContainer] = useState<HTMLElement>();

	let modelSearchSection;
	switch(addMode) {
		case "wiki":
			modelSearchSection = (
				<>
					<SelectWiki
						types={MODELED_WIKI_TYPES}
						onChange={(wiki: ModeledWiki) => {
							setSelectedModel({model: wiki.model, wiki});
							setModelColor(wiki.modelColor);
						}}
						hasModel={true}
					/>
					{selectedModel && (
						<div ref={setModelViewerContainer}>
							<ModelViewer
								model={selectedModel.model}
								defaultColor={selectedModel.wiki && selectedModel.wiki.modelColor}
								showColorControls={true}
								onChangeColor={async (color) => setModelColor(color)}
								container={modelViewerContainer}
							/>
						</div>
					)}
				</>
			);
			break;
		case "model":
			modelSearchSection = (
				<>
					<SelectModel
						onChange={async (model) => {
							setSelectedModel({ model })
						}}
						showClear={false}
					/>
					{selectedModel && (
						<div ref={setModelViewerContainer}>
							<ModelViewer
								model={selectedModel.model}
								defaultColor={selectedModel.wiki && selectedModel.wiki.modelColor}
								showColorControls={true}
								onChangeColor={async (color) => setModelColor(color)}
								container={modelViewerContainer}
							/>
						</div>
					)}
				</>
			);
			break;
		case "token":
			modelSearchSection = (<div style={{marginTop: "1em", marginBottom: "1em"}}>
				<div style={{display: "flex", gap: "1em", marginBottom: "1em"}}>
					<PrimaryButton
						onClick={async () => {
							setCreateTokenModalVisible(true);
						}}
					>
						Select Token Icon
					</PrimaryButton>
				</div>
				<RadioButtonGroup
					style={{marginTop: "1em"}}
					onChange={async (value: string) => {
						setSelectedTokenType(value);
					}}
					defaultValue={"CIRCLE"}
				>
					<RadioButton value={"CIRCLE"}>
						Circle
					</RadioButton>
					<RadioButton value={"SQUARE"}>
						Square
					</RadioButton>
				</RadioButtonGroup>
				<div>
					<span className={"margin-md-right"}>Token Color:</span>
					<ColorInput
						style={{
							width: "100px",
						}}
						value={modelColor}
						onChange={(e) => {
							const value = e.target.value;
							setModelColor(value);
						}}
					/>
				</div>
			</div>);
			break;
	}
	return (
		<div className={"padding-lg-top"}>
			<div style={{display: "flex", marginBottom: "1em"}}>
				<RadioButtonGroup 
					onChange={function (string: any) {
						setAddMode(string as "wiki" | "model" | "token");
						setSelectedModel(null);
						setModelColor(null);
						setSelectedTokenIcon(null);
						setSelectedTokenType("CIRCLE");
					} } 
					defaultValue={"wiki"}
				>
					<RadioButton value={"wiki"}>
						Wiki Page
					</RadioButton>
					<RadioButton value={"model"}>
						Model
					</RadioButton>
					<RadioButton value="token">
						Token
					</RadioButton>
				</RadioButtonGroup>
			</div>

			{modelSearchSection}
			
			{(selectedModel || addMode === 'token') && (
				<PrimaryButton
					className={"margin-lg-top"}
					onClick={async () => {
						await addModel({
							gameId: currentGame._id,
							modelId: selectedModel?.model._id,
							wikiId: selectedModel?.wiki ? selectedModel.wiki._id : null,
							color: modelColor,
							tokenId: selectedTokenIcon ? selectedTokenIcon._id : undefined,
							tokenType: addMode === 'token' ? selectedTokenType : undefined,
						});
					}}
				>
					Add Model
				</PrimaryButton>
			)}

			<ManageTokenIcons
				visible={createTokenModalVisible}
				setVisible={async (visible) => setCreateTokenModalVisible(visible)}
				onChange={async (tokenIcon) => {
					setSelectedTokenIcon(tokenIcon);
					setCreateTokenModalVisible(false);
				}}
			/>
		</div>
	);
};
