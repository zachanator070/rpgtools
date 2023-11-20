import FullScreenModal from "../widgets/FullScreenModal";
import LoadingView from "../LoadingView";
import PrimaryButton from "../widgets/PrimaryButton";
import React from "react";
import useLoad5eContent from "../../hooks/world/useLoad5eContent";
import { useNavigate } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";

export default function () {
	const { currentWorld } = useCurrentWorld();
	const { load5eContent, loading: contentLoading } = useLoad5eContent();
	const navigate = useNavigate();

	return (
		<>
			<FullScreenModal title={"Loading 5e content ..."} visible={contentLoading} closable={false}>
				<LoadingView />
			</FullScreenModal>
			<h2>Load 5e Content</h2>
			<div className={"margin-lg-top"}>
				<PrimaryButton
					loading={contentLoading}
					onClick={async () => {
						await load5eContent({
							worldId: currentWorld._id,
						});
						navigate(`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`);
					}}
				>
					Load
				</PrimaryButton>
			</div>
		</>
	);
}
