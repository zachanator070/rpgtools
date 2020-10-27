import React, { useState } from "react";
import useCurrentWorld from "../hooks/world/useCurrentWorld";
import { PermissionEditor } from "./permissions/PermissionEditor";
import { Form, Upload, Button, Col, Input, Row, Modal, Checkbox } from "antd";
import { useRenameWorld } from "../hooks/world/useRenameWorld";
import { WORLD } from "@rpgtools/common/src/type-constants";
import { LoadingView } from "./LoadingView";
import { useLoad5eContent } from "../hooks/world/useLoad5eContent";
import { useHistory } from "react-router-dom";

export default () => {
	const { currentWorld, loading: currentWorldLoading } = useCurrentWorld();
	const [newName, setNewName] = useState();
	const { renameWorld, loading } = useRenameWorld();
	const { load5eContent, loading: contentLoading } = useLoad5eContent();
	const [getCC, setGetCC] = useState();
	const [getTob, setGetTob] = useState();
	const history = useHistory();

	if (currentWorldLoading) {
		return <LoadingView />;
	}

	if (!currentWorld) {
		return <div>404 - World not found</div>;
	}

	return (
		<div className="margin-md-left margin-md-top margin-lg-bottom">
			<h1>Settings for {currentWorld.name}</h1>
			<hr />
			<Row className={"margin-lg-top"}>
				<Col span={4} />
				<Col span={16}>
					<h2>Permissions</h2>
					<div className={"margin-lg-top"}>
						<PermissionEditor subject={currentWorld} subjectType={WORLD} />
					</div>
				</Col>
				<Col span={4} />
			</Row>

			{currentWorld.canWrite && (
				<>
					<Row className={"margin-lg-top"}>
						<Col span={4} />
						<Col span={16}>
							<h2>Rename World</h2>
							<div style={{ display: "flex" }} className={"margin-lg-top"}>
								<div className="margin-md-right">New Name:</div>
								<div>
									<Input
										value={newName}
										onChange={async (e) => {
											await setNewName(e.target.value);
										}}
									/>
								</div>
							</div>
							<Button
								className={"margin-md-top"}
								onClick={async () => {
									await renameWorld(currentWorld._id, newName);
								}}
								disabled={loading}
							>
								Submit
							</Button>
						</Col>
						<Col span={4} />
					</Row>
					<Row className={"margin-lg-top"}>
						<Col span={4} />
						<Col span={16}>
							<Modal visible={contentLoading} closable={false} footer={null}>
								<LoadingView /> Loading 5e content ...
							</Modal>
							<h2>Load 5e Content</h2>
							<div className={"margin-lg"}>
								<Checkbox
									onChange={async (e) => await setGetCC(e.target.checked)}
								>
									Creature Codex
								</Checkbox>
								<Checkbox
									onChange={async (e) => await setGetTob(e.target.checked)}
								>
									Tome of Beasts
								</Checkbox>
							</div>
							<div className={"margin-lg-top"}>
								<Button
									type={"primary"}
									loading={contentLoading}
									onClick={async () => {
										await load5eContent({
											worldId: currentWorld._id,
											creatureCodex: getCC,
											tomeOfBeasts: getTob,
										});
										history.push(
											`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`
										);
									}}
								>
									Load
								</Button>
							</div>
						</Col>
						<Col span={4} />
					</Row>
				</>
			)}
		</div>
	);
};
