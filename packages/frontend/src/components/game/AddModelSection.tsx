import React, { useEffect, useState } from "react";
import { SelectModel } from "../select/SelectModel";
import { Switch, Button } from "antd";
import { ModelViewer } from "../models/ModelViewer";
import { useAddModel } from "../../hooks/game/useAddModel";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import { SelectWiki } from "../select/SelectWiki";
import { MODELED_WIKI_TYPES } from "../../../../common/src/type-constants";
import {ModeledWiki} from "../../types";

interface SelectedModel {
	model: any;
	wiki?: any;
}

export const AddModelSection = () => {
	const [selectedModel, setSelectedModel] = useState<SelectedModel>();
	const { currentGame } = useCurrentGame();
	const { addModel } = useAddModel();
	const [modelColor, setModelColor] = useState<string>();

	const [wikiSearch, setWikiSearch] = useState<boolean>(true);

	useEffect(() => {
		(async () => {
			await setSelectedModel(null);
		})();
	}, [wikiSearch]);

	return (
		<div className={"margin-lg"}>
			<div>
				<span className={"margin-md"}>Search for</span>

				<Switch
					checkedChildren={"Wiki's with Models"}
					unCheckedChildren={"Model's only"}
					defaultChecked
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
				/>
			) : (
				<SelectModel
					onChange={async (model) => {
						await setSelectedModel({ model })
					}}
					showClear={false}
				/>
			)}

			<Button
				type={"primary"}
				className={"margin-lg"}
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
			</Button>
			{selectedModel && (
				<div style={{ width: "100%", height: "500px" }}>
					<ModelViewer
						model={selectedModel.model}
						defaultColor={selectedModel.wiki && selectedModel.wiki.modelColor}
						showColorControls={true}
						onChangeColor={async (color) => setModelColor(color)}
					/>
				</div>
			)}
		</div>
	);
};
