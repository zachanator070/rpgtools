import React, { useEffect, useRef, useState } from "react";
import useSetModelColor from "../../../hooks/game/useSetModelColor";
import useCurrentGame from "../../../hooks/game/useCurrentGame";
import SelectWiki from "../../select/SelectWiki";
import useSetPositionedModelWiki from "../../../hooks/game/useSetPositionedModelWiki";
import useGameModelPositionedSubscription from "../../../hooks/game/useGameModelPosistionedSubscription";
import LoadingView from "../../LoadingView";
import useDeletePositionedModel from "../../../hooks/game/useDeletePositionedModel";
import {CONTROLS_SETUP_EVENT, GameRenderer} from "../../../rendering/GameRenderer";
import { MODEL_SELECTED_EVENT } from "../../../controls/SelectModelControls";
import {PositionedModel, WikiPage} from "../../../types";
import PrimaryButton from "../../widgets/PrimaryButton";
import PrimaryDangerButton from "../../widgets/PrimaryDangerButton";
import TextInput from "../../widgets/input/TextInput";
import ColorInput from "../../widgets/input/ColorInput";

interface ModelInfoProps {
	renderer: GameRenderer,
	setGameWikiId: (wikiId: string) => Promise<any>
}

export default function ModelInfo({ renderer, setGameWikiId }: ModelInfoProps) {
	const { currentGame, loading } = useCurrentGame();
	const [positionedModel, setPositionedModel] = useState<PositionedModel>();
	const [newWiki, setNewWiki] = useState<WikiPage>();
	const [color, setColor] = useState<string>();
	const { setModelColor } = useSetModelColor();
	const { setPositionedModelWiki } = useSetPositionedModelWiki();
	const { gameModelPositioned } = useGameModelPositionedSubscription();
	const { deletePositionedModel } = useDeletePositionedModel();

	const onControlsSetup = useRef(() => {
		renderer.selectModelControls.on(MODEL_SELECTED_EVENT, (model) => {
			setPositionedModel(model);
		});
	});

	const onModelSelected = useRef((model) => {
		setPositionedModel(model);
	});

	useEffect(() => {
		if (renderer) {
			renderer.on(CONTROLS_SETUP_EVENT, onControlsSetup.current);

			if (renderer.selectModelControls) {
				renderer.selectModelControls.on(
					MODEL_SELECTED_EVENT,
					onModelSelected.current
				);
				(async () => {
					await setPositionedModel(
						renderer.selectModelControls.getPositionedModel()
					);
				})();
			}
		}
		return () => {
			if (renderer) {
				renderer.off(CONTROLS_SETUP_EVENT, onControlsSetup.current);

				if (renderer.selectModelControls) {
					renderer.selectModelControls.off(
						MODEL_SELECTED_EVENT,
						onModelSelected.current
					);
				}
			}
		};
	}, [renderer]);

	useEffect(() => {
		(async () => {
			if (positionedModel) {
				await setColor(positionedModel.color);
			}
		})();
	}, [positionedModel]);

	useEffect(() => {
		if (
			gameModelPositioned &&
			positionedModel &&
			positionedModel._id === gameModelPositioned._id
		) {
			(async () => {
				await setPositionedModel(gameModelPositioned);
			})();
		}
	}, [gameModelPositioned]);

	if (loading) {
		return <LoadingView />;
	}

	let content;

	let name = null;
	if (positionedModel) {
		name = positionedModel.model.name;
		if (positionedModel.wiki) {
			name = positionedModel.wiki.name;
		}
	}

	if (!positionedModel) {
		content = <h2>No Model Selected</h2>;
	} else {
		content = (
			<>
				<h2>{name}</h2>
				{positionedModel.wiki && (
					<div className={"margin-lg"}>
						<a
							onClick={async () =>
								await setGameWikiId(positionedModel.wiki._id)
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
											positionedModelId: positionedModel._id,
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
								onChange={async (e) => {
									const value = e.target.value;
									await setColor(value);
								}}
							/>
							<div style={{display: "flex", marginTop: "1em"}}>
								<PrimaryButton
									onClick={async () => {
										await setModelColor({
											positionedModelId: positionedModel._id,
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
											positionedModelId: positionedModel._id,
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
								await renderer.selectModelControls.select();
								await deletePositionedModel({
									gameId: currentGame._id,
									positionedModelId: positionedModel._id,
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
