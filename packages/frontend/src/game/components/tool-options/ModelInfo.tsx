import React, {useContext, useEffect, useState} from "react";
import useSetModelColor from "../../../hooks/game/useSetModelColor.js";
import useCurrentGame from "../../../hooks/game/useCurrentGame.js";
import useSetPositionedModelWiki from "../../../hooks/game/useSetPositionedModelWiki.js";
import useGameModelPositionedSubscription from "../../../hooks/game/useGameModelPosistionedSubscription.js";
import useDeletePositionedModel from "../../../hooks/game/useDeletePositionedModel.js";
import {PositionedModel, WikiPage} from "../../../types.js";
import GameControllerFacade from "../../GameControllerFacade.js";
import LoadingView from "../../../components/LoadingView.js";
import SelectWiki from "../../../components/select/SelectWiki.js";
import PrimaryButton from "../../../components/widgets/PrimaryButton.js";
import ColorInput from "../../../components/widgets/input/ColorInput.js";
import PrimaryDangerButton from "../../../components/widgets/PrimaryDangerButton.js";
import {ControllerContext} from "../GameContent.js";
import useGameModelDeletedSubscription from "../../../hooks/game/useGameModelDeletedSubscription.js";

interface ModelInfoProps {
	setGameWikiId: (wikiId: string) => Promise<any>
}

export default function ModelInfo({ setGameWikiId }: ModelInfoProps) {
	const { currentGame, loading } = useCurrentGame();
	const [selectedPositionedModel, setSelectedPositionedModel] = useState<PositionedModel>();
	const [newWiki, setNewWiki] = useState<WikiPage>();
	const [color, setColor] = useState<string>();
	const { setModelColor } = useSetModelColor();
	const { setPositionedModelWiki } = useSetPositionedModelWiki();
	const { gameModelPositioned } = useGameModelPositionedSubscription();
	const { deletePositionedModel } = useDeletePositionedModel();
	const controllerFacade = useContext<GameControllerFacade>(ControllerContext);
	useGameModelDeletedSubscription((model) => {
		if (model._id === selectedPositionedModel?._id) {
			setSelectedPositionedModel(null);
		}
	});

	useEffect(() => {
		controllerFacade.addSelectedModelCallback((model) => setSelectedPositionedModel(model));
	}, []);

	useEffect(() => {
		if (selectedPositionedModel) {
			setColor(selectedPositionedModel.color);
		}
	}, [selectedPositionedModel]);

	useEffect(() => {
		if (
			gameModelPositioned &&
			selectedPositionedModel &&
			selectedPositionedModel._id === gameModelPositioned._id
		) {
			setSelectedPositionedModel(gameModelPositioned);
		}
	}, [gameModelPositioned]);

	if (loading) {
		return <LoadingView />;
	}

	let content;

	let name = null;
	if (selectedPositionedModel) {
		name = selectedPositionedModel.model.name;
		if (selectedPositionedModel.wiki) {
			name = selectedPositionedModel.wiki.name;
		}
	}

	if (!selectedPositionedModel) {
		content = <h2>No Model Selected</h2>;
	} else {
		content = (
			<>
				<h2>{name}</h2>
				{selectedPositionedModel.wiki && (
					<div className={"margin-lg"}>
						<a
							onClick={async () =>
								await setGameWikiId(selectedPositionedModel.wiki._id)
							}
						>
							Show Wiki
						</a>
					</div>
				)}
				{currentGame.canModel && (
					<div>
						<h3>Set Wiki Page:</h3>
						<div style={{marginLeft: "1em"}}>
							<SelectWiki
								onChange={async (wiki) => setNewWiki(wiki)}
								showClear={true}
							>
								<PrimaryButton
									onClick={async () =>
										await setPositionedModelWiki({
											positionedModelId: selectedPositionedModel._id,
											wikiId: newWiki ? newWiki._id : null,
										})
									}
								>
									Set Wiki
								</PrimaryButton>
							</SelectWiki>
						</div>

						<h3 style={{marginTop: "1em"}}>Select Color:</h3>
						<div style={{marginLeft: "1em"}}>
							<ColorInput
								value={color}
								style={{
									width: "100px",
								}}
								onChange={(e) => {
									const value = e.target.value;
									setColor(value);
								}}
							/>
							<div style={{display: "flex", marginTop: "1em"}}>
								<PrimaryButton
									onClick={async () => {
										await setModelColor({
											positionedModelId: selectedPositionedModel._id,
											color: color,
										});
									}}
									style={{marginRight: "1em"}}
								>
									Set Color
								</PrimaryButton>
								<PrimaryButton
									onClick={async () => {
										await setModelColor({
											positionedModelId: selectedPositionedModel._id,
											color: null,
										});
									}}
								>
									Clear Color
								</PrimaryButton>
							</div>
						</div>

						<PrimaryDangerButton
							onClick={async () => {
								controllerFacade.clearSelection();
								await deletePositionedModel({
									gameId: currentGame._id,
									positionedModelId: selectedPositionedModel._id,
								});
							}}
							style={{marginTop: "1em"}}
						>
							Delete Model
						</PrimaryDangerButton>

					</div>
				)}
			</>
		);
	}

	return <div className={"margin-lg"}>{content}</div>;
};
