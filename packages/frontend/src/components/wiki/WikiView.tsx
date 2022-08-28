import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { Route, Switch, useRouteMatch } from "react-router-dom";
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
	const match = useRouteMatch();

	const [permissionModalVisibility, setPermissionModalVisibility] = useState(
		false
	);

	if (worldLoading) {
		return <LoadingView />;
	}

	return (
		<div style={{ overflow: "hidden" }}>
			{currentWiki && (
				<PermissionModal
					visibility={permissionModalVisibility}
					setVisibility={async (visible: boolean) => setPermissionModalVisibility(visible)}
					subject={currentWiki}
					subjectType={currentWiki.type}
					refetch={async () => await refetch({})}
				/>
			)}

			<ColumnedContent>
				<div
					className="padding-md"
					style={{
						height: "100%",
						overflowY: "auto",
					}}
				>
					<FolderTree
						folder={currentWorld.rootFolder}
						refetch={async () => {
							await refetch({})
						}}
					/>
				</div>
				<div
					style={{
						height: "100%",
						overflowY: "auto",
					}}
					className="padding-md"
				>
					<Switch>
						<Route path={`${match.path}/edit`}>
							<WikiEdit />
						</Route>
						<Route path={`${match.path}/view`}>
							<WikiContent
								currentWiki={currentWiki}
								wikiLoading={wikiLoading}
							/>
						</Route>
					</Switch>
				</div>
				<div className="padding-md">
					<Route path={`${match.path}/view`}>
						{currentWiki && (
							<a
								title={"View permissions for this page"}
								onClick={async () => {
									await setPermissionModalVisibility(true);
								}}
							>
								<PeopleIcon/>
							</a>
						)}
					</Route>
				</div>
			</ColumnedContent>
		</div>
	);
};
