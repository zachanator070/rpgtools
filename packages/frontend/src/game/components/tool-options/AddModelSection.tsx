import React, { useEffect, useState } from "react";
import useAddModel from "../../../hooks/game/useAddModel";
import useCurrentGame from "../../../hooks/game/useCurrentGame";
import { MODELED_WIKI_TYPES } from "@rpgtools/common/src/type-constants";
import {Image, ModeledWiki} from "../../../types";
import SelectWiki from "../../../components/select/SelectWiki";
import SelectModel from "../../../components/select/SelectModel";
import ModelViewer from "../../../components/models/ModelViewer";
import PrimaryButton from "../../../components/widgets/PrimaryButton";
import RadioButtonGroup from "../../../components/widgets/RadioButtonGroup";
import RadioButton from "../../../components/widgets/RadioButton";
import SelectTokenModal from "../../../components/modals/SelectTokenModal";
import ColorInput from "../../../components/widgets/input/ColorInput";
import { TokenIcon } from "../../../types";
import PrimaryDangerButton from "../../../components/widgets/PrimaryDangerButton";
import Toggle from "../../../components/widgets/Toggle";

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

	const [addMode, setAddMode] = useState<"model" | "token">("model");
	const [modelSearch, setModelSearch] = useState<string>("model");

	const [modelViewerContainer, setModelViewerContainer] = useState<HTMLElement>();

	const TOKEN_ICON_SIZE = "6em";

	let modelSearchSection = <div style={{display: "flex", flexDirection: "column", gap: "1em"}}>
		<div>
			<Toggle
				onChange={(value) => setModelSearch(value)}
				checkedChildren={"Model Search"}
				unCheckedChildren={"Wikis with Models Search"}
				defaultChecked={true}
			/>
		</div>
		{modelSearch ? <SelectModel
			onChange={async (model) => {
				setSelectedModel({ model })
			}}
			showClear={false}
		/> : <SelectWiki
			types={MODELED_WIKI_TYPES}
			onChange={(wiki: ModeledWiki) => {
				setSelectedModel({model: wiki.model, wiki});
				setModelColor(wiki.modelColor);
			}}
			hasModel={true}
		/>}
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
	</div>;
	if (addMode === "token") {
		modelSearchSection = (<div style={{marginTop: "1em", marginBottom: "1em"}}>
			<div style={{marginBottom: "1em", display: "flex"}}>
				<div style={{marginRight: "1em"}}>
					{selectedTokenIcon ? (
						<img
							src={selectedTokenIcon.image.icon && selectedTokenIcon.image.icon.chunks && selectedTokenIcon.image.icon.chunks[0] ? `/images/${selectedTokenIcon.image.icon.chunks[0].fileId}` : ''}
							alt={selectedTokenIcon.name || "Token Icon"}
							style={{ width: TOKEN_ICON_SIZE, height: TOKEN_ICON_SIZE, objectFit: "contain", border: "1px solid #ccc", borderRadius: 4, background: "#fff" }}
						/>
					) : (
						<div style={{ width: TOKEN_ICON_SIZE, height: TOKEN_ICON_SIZE, border: "2px dashed #aaa", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", background: "#fafafa" }}>
							<span style={{ fontSize: 12 }}>No Icon</span>
						</div>
					)}
				</div>
				<div style={{display: "flex", gap: "1em", marginBottom: "1em", flexDirection: "column"}}>
					<PrimaryButton
						onClick={async () => {
							setCreateTokenModalVisible(true);
						}}
					>
						Select Token Icon
					</PrimaryButton>
					<PrimaryDangerButton
						disabled={!selectedTokenIcon}
						onClick={async () => {
							setSelectedTokenIcon(null);
						}}
					>
						Clear Icon
					</PrimaryDangerButton>
				</div>
			</div>
			<RadioButtonGroup
				style={{marginBottom: "1rem"}}
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
				<span className={"margin-md-right"}>Color:</span>
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
	}
	return (
		<div className={"padding-lg-top"}>
			<div style={{display: "flex", marginBottom: "1em"}}>
				<RadioButtonGroup 
					onChange={function (string: any) {
						setAddMode(string as "model" | "token");
						setSelectedModel(null);
						setModelColor(null);
						setSelectedTokenIcon(null);
						setSelectedTokenType("CIRCLE");
					} } 
					defaultValue={"model"}
				>
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
							modelId: selectedModel?.model._id || undefined,
							wikiId: selectedModel?.wiki ? selectedModel.wiki._id : undefined,
							color: modelColor || undefined,
							tokenId: selectedTokenIcon ? selectedTokenIcon._id : undefined,
							tokenType: addMode === 'token' ? selectedTokenType : undefined,
						});
					}}
				>
					Add Model
				</PrimaryButton>
			)}

			<SelectTokenModal
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
