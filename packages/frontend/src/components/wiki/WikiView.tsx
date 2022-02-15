import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import React, { useState } from "react";
import { PermissionModal } from "../modals/PermissionModal";
import { Col, Row } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { WikiEdit } from "./WikiEdit";
import { WikiContent } from "./WikiContent";
import { FolderTree } from "./FolderTree";
import { LoadingView } from "../LoadingView";

export const WikView = () => {
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

			<Row
				style={{
					height: "100%",
				}}
			>
				<Col
					span={4}
					className="padding-md"
					style={{
						height: "100%",
						overflowY: "auto",
					}}
				>
					<FolderTree folder={currentWorld.rootFolder} />
				</Col>
				<Col
					span={16}
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
				</Col>
				<Col span={4} className="padding-md">
					<Route path={`${match.path}/view`}>
						{currentWiki && (
							<a
								title={"View permissions for this page"}
								onClick={async () => {
									await setPermissionModalVisibility(true);
								}}
							>
								<TeamOutlined style={{ fontSize: "20px" }} />
							</a>
						)}
					</Route>
				</Col>
			</Row>
		</div>
	);
};
