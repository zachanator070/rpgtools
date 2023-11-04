
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { Route, Routes } from "react-router-dom";
import React from "react";
import WikiEdit from "./edit/WikiEdit";
import FolderTree from "./folder-tree/FolderTree";
import LoadingView from "../LoadingView";
import ColumnedContent from "../widgets/ColumnedContent";
import WikiView from "./view/WikiView";
import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import WikiPermissionsButton from "./view/WikiPermissionsButton";

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
