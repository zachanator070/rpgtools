import React, { useEffect, useState } from "react";
import useAddModel from "../../../hooks/game/useAddModel.js";
import useCurrentGame from "../../../hooks/game/useCurrentGame.js";
import { MODELED_WIKI_TYPES } from "@rpgtools/common/src/type-constants.js";
import {ModeledWiki} from "../../../types.js";
import Toggle from "../../../components/widgets/Toggle.js";
import SelectWiki from "../../../components/select/SelectWiki.js";
import SelectModel from "../../../components/select/SelectModel.js";
import ModelViewer from "../../../components/models/ModelViewer.js";
import PrimaryButton from "../../../components/widgets/PrimaryButton.js";
interface SelectedModel {
	model: any;
	wiki?: any;
}

export default function AddModelSection() {
	const [selectedModel, setSelectedModel] = useState<SelectedModel>();
	const { currentGame } = useCurrentGame();
	const { addModel } = useAddModel();
	const [modelColor, setModelColor] = useState<string>();

	const [wikiSearch, setWikiSearch] = useState<boolean>(true);

	const [modelViewerContainer, setModelViewerContainer] = useState<HTMLElement>();

	useEffect(() => {
		setSelectedModel(null);
	}, [wikiSearch]);

	return (
		<div className={"padding-lg-top"}>
			<div style={{display: "flex", marginBottom: "1em"}}>
				<div style={{marginLeft: "1em", marginRight: "1em"}}>Search for</div>

				<Toggle
					checkedChildren={"Wiki's with Models"}
					unCheckedChildren={"Model's only"}
					defaultChecked={true}
					onChange={(checked) => {
						setWikiSearch(checked);
					}}
				/>
			</div>
			{wikiSearch ? (
				<SelectWiki
					types={MODELED_WIKI_TYPES}
					onChange={(wiki: ModeledWiki) => {
						setSelectedModel({model: wiki.model, wiki});
						setModelColor(wiki.modelColor);
					}}
					hasModel={true}
				/>
			) : (
				<SelectModel
					onChange={async (model) => {
						setSelectedModel({ model })
					}}
					showClear={false}
				/>
			)}
			{selectedModel && (
				<div ref={setModelViewerContainer}>
					<ModelViewer
						model={selectedModel.model}
						defaultColor={selectedModel.wiki && selectedModel.wiki.modelColor}
						showColorControls={true}
						onChangeColor={async (color) => setModelColor(color)}
						container={modelViewerContainer}
					/>
					<PrimaryButton
						className={"margin-lg-top"}
						disabled={!selectedModel}
						onClick={async () => {
							await addModel({
								gameId: currentGame._id,
								modelId: selectedModel.model._id,
								wikiId: selectedModel.wiki ? selectedModel.wiki._id : null,
								color: modelColor,
							});
						}}
					>
						Add Model
					</PrimaryButton>
				</div>
			)}
		</div>
	);
};
