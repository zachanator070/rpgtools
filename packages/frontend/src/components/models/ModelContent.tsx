import React from "react";
import { useHistory } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import LoadingView from "../LoadingView";
import ModelViewer from "./ModelViewer";
import {Model} from "../../types";
import PrimaryButton from "../widgets/PrimaryButton";
import FormattedTable from "../widgets/FormattedTable";
import EditIcon from "../widgets/icons/EditIcon";
import DownloadIcon from "../widgets/icons/DownloadIcon";

interface ModelContentProps {
	model: Model;
}

export default function ModelContent({ model }: ModelContentProps) {
	const history = useHistory();
	const { currentWorld, loading } = useCurrentWorld();

	if (loading) {
		return <LoadingView />;
	}

	return (
		<div style={{display: "flex"}}>
			<div style={{flexGrow: 1}}>
				<div className={"margin-lg"}>
					Filename: {model.fileName}
					<a className={"margin-lg-left"} href={`/models/${model.fileId}`}>
						Download Model <DownloadIcon />
					</a>
				</div>
				<div style={{ width: "500px" }}>
					<FormattedTable
						headers={["Dimension", "Value"]}
						data={[["Depth", model.depth],["Width", model.width],["Height", model.height]]}
						/>
				</div>
				<div className={"margin-lg"}>
					Notes:
					<div>
						{model.notes && (
							<textarea
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
								history.push(
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
			<div style={{flexGrow: 1}}>
				<div style={{ width: 500, height: 750 }}>
					<ModelViewer model={model} />
				</div>
			</div>
		</div>
	);
};
