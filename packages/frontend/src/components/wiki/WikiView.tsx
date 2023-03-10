
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { Route, Routes } from "react-router-dom";
import React from "react";
import WikiEdit from "./WikiEdit";
import FolderTree from "./folder-tree/FolderTree";
import LoadingView from "../LoadingView";
import ColumnedContent from "../widgets/ColumnedContent";
import WikiViewContent from "./WikiViewContent";
import WikiViewPermissions from "./WikiViewPermissions";

export default function WikView() {
	const { currentWorld, loading: worldLoading } = useCurrentWorld();

	if (worldLoading) {
		return <LoadingView />;
	}

	return (
		<>
			<ColumnedContent stickySides={true}>
				<div className="padding-md">
					<FolderTree folder={currentWorld.rootFolder}/>
				</div>
				<div className="padding-md" >
					<WikiViewContent/>
				</div>
				<div className="padding-md">
					<WikiViewPermissions/>
				</div>
			</ColumnedContent>
		</>
	);
};
