import React, {useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import LoadingView from "../LoadingView.js";
import ModelViewer from "./ModelViewer.js";
import {Model} from "../../types.js";
import PrimaryButton from "../widgets/PrimaryButton.js";
import FormattedTable from "../widgets/FormattedTable.js";
import EditIcon from "../widgets/icons/EditIcon.js";
import DownloadIcon from "../widgets/icons/DownloadIcon.js";
import TextAreaInput from "../widgets/input/TextAreaInput.js";

interface ModelContentProps {
	model: Model;
}

export default function ModelContent({ model }: ModelContentProps) {
	const navigate = useNavigate();
	const { currentWorld, loading } = useCurrentWorld();

	const [modelViewerContainer, setModelViewerContainer] = useState<HTMLElement>();

	if (loading) {
		return <LoadingView />;
	}

	return (
		<div style={{display: "flex", flexDirection: 'column'}} className={'padding-xlg-bottom'}>
			<div ref={setModelViewerContainer} style={{paddingLeft: '25%', paddingRight: '25%'}}>
				<ModelViewer model={model} container={modelViewerContainer}/>
			</div>
			<div style={{display: 'flex', flexDirection: 'column'}}>
				<div style={{alignSelf: 'center'}}>
					<div className={"margin-lg"}>
						Filename: {model.fileName}
						<a className={"margin-lg-left"} href={`/models/${model.fileId}`}>
							Download Model <DownloadIcon />
						</a>
					</div>
					<div>
						<FormattedTable
							style={{ width: "30em" }}
							headers={["Dimension", "Value"]}
							data={[["Depth", model.depth],["Width", model.width],["Height", model.height]]}
						/>
					</div>
					<div className={"margin-lg"}>
						Notes:
						<div>
							{model.notes && (
								<TextAreaInput
									rows={15}
									cols={50}
									readOnly={true}
									value={model.notes}
								/>
							)}
						</div>
					</div>
					<span>
						<span className={"margin-lg"}>
							<PrimaryButton
								onClick={() =>
									navigate(
										`/ui/world/${currentWorld._id}/model/${model._id}/edit`
									)
								}
							>
								Edit
								<EditIcon />
							</PrimaryButton>
						</span>
						<span className={"margin-lg"}>
							<PrimaryButton
								onClick={() => {
									window.location.href = `/export/Model/${model._id}`;
								}}
							>
								Export
							</PrimaryButton>
						</span>
					</span>
				</div>
			</div>
		</div>
	);
};
