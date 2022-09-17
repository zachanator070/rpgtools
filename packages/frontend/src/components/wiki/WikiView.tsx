import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { Route, Routes } from "react-router-dom";
import React, { useState } from "react";
import PermissionModal from "../modals/PermissionModal";
import WikiEdit from "./WikiEdit";
import WikiContent from "./WikiContent";
import FolderTree from "./FolderTree";
import LoadingView from "../LoadingView";
import ColumnedContent from "../widgets/ColumnedContent";
import PeopleIcon from "../widgets/icons/PeopleIcon";

export default function WikView() {
	const { currentWiki, loading: wikiLoading, refetch } = useCurrentWiki();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();

	const [permissionModalVisibility, setPermissionModalVisibility] = useState(
		false
	);

	if (worldLoading) {
		return <LoadingView />;
	}

	return (
		<>
			{currentWiki && (
				<PermissionModal
					visibility={permissionModalVisibility}
					setVisibility={async (visible: boolean) => setPermissionModalVisibility(visible)}
					subject={currentWiki}
					subjectType={currentWiki.type}
					refetch={async () => await refetch({})}
				/>
			)}

			<ColumnedContent stickySides={true}>
				<div className="padding-md">
					<FolderTree
						folder={currentWorld.rootFolder}
						refetch={async () => {
							await refetch({})
						}}
					/>
				</div>
				<div className="padding-md" >
					<Routes>
						<Route path={`edit`} element={<WikiEdit />}/>
						<Route
							path={`view`}
							element={<WikiContent
								currentWiki={currentWiki}
								wikiLoading={wikiLoading}
							/>}
						/>

					</Routes>
				</div>
				<div className="padding-md">
					<Routes>
						{currentWiki &&
							<Route
								path={`view`}
								element={
									<a
										title={"View permissions for this page"}
										onClick={async () => {
											await setPermissionModalVisibility(true);
										}}
									>
										<PeopleIcon/>
									</a>
								}
							/>
						}
					</Routes>
				</div>
			</ColumnedContent>
		</>
	);
};
