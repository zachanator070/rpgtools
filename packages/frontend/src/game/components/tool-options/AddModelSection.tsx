import React, { useEffect, useState } from "react";
import SelectModel from "../../select/SelectModel";
import ModelViewer from "../../models/ModelViewer";
import useAddModel from "../../../hooks/game/useAddModel";
import useCurrentGame from "../../../hooks/game/useCurrentGame";
import SelectWiki from "../../select/SelectWiki";
import { MODELED_WIKI_TYPES } from "@rpgtools/common/src/type-constants";
import {ModeledWiki} from "../../../types";
import PrimaryButton from "../../widgets/PrimaryButton";
import Toggle from "../../widgets/Toggle";

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
		(async () => {
			await setSelectedModel(null);
		})();
	}, [wikiSearch]);

	return (
		<div className={"padding-lg-top"}>
			<div style={{display: "flex", marginBottom: "1em"}}>
				<div style={{marginLeft: "1em", marginRight: "1em"}}>Search for</div>

				<Toggle
					checkedChildren={"Wiki's with Models"}
					unCheckedChildren={"Model's only"}
					defaultChecked={true}
					onChange={async (checked) => {
						await setWikiSearch(checked);
					}}
				/>
			</div>
			{wikiSearch ? (
				<SelectWiki
					types={MODELED_WIKI_TYPES}
					onChange={async (wiki: ModeledWiki) => {
						setSelectedModel({model: wiki.model, wiki});
						await setModelColor(wiki.modelColor);
					}}
					hasModel={true}
				/>
			) : (
				<SelectModel
					onChange={async (model) => {
						await setSelectedModel({ model })
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
