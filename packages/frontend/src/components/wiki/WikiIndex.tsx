
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import { Route, Routes } from "react-router-dom";
import React from "react";
import WikiEdit from "./edit/WikiEdit.tsx";
import FolderTree from "./folder-tree/FolderTree.tsx";
import LoadingView from "../LoadingView.tsx";
import ColumnedContent from "../widgets/ColumnedContent.tsx";
import WikiView from "./view/WikiView.tsx";
import useCurrentWiki from "../../hooks/wiki/useCurrentWiki.js";
import WikiPermissionsButton from "./view/WikiPermissionsButton.tsx";

export default function WikiIndex() {
	const { currentWorld, loading: worldLoading } = useCurrentWorld();
	const { currentWiki, loading: wikiLoading } = useCurrentWiki();

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
					<Routes>
						<Route path={`edit`} element={<WikiEdit />}/>
						<Route
							path={`view`}
							element={<WikiView
								currentWiki={currentWiki}
								wikiLoading={wikiLoading}
							/>}
						/>
					</Routes>
				</div>

				<div className="padding-md">
					<Routes>
						<Route
							path={`view`}
							element={<WikiPermissionsButton/>}
						/>
					</Routes>
				</div>

			</ColumnedContent>
		</>
	);
};
