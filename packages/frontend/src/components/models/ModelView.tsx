import React, { useEffect, useState } from "react";
import { useGetModels } from "../../hooks/model/useGetModels";
import { Row, Col, List, Button } from "antd";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { PermissionModal } from "../modals/PermissionModal";
import { MODEL } from "../../../../common/src/type-constants";
import { TeamOutlined } from "@ant-design/icons";
import { LoadingView } from "../LoadingView";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { CreateModelModal } from "./CreateModelModal";
import { ModelEdit } from "./ModelEdit";
import { ModelContent } from "./ModelContent";
import { useParams, useHistory } from "react-router-dom";
import {Model} from "../../types";

export const ModelView = () => {
	const { models, loading, refetch } = useGetModels();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();

	const [selectedModel, setSelectedModel] = useState<Model>();
	const match = useRouteMatch();
	const [permissionModalVisibility, setPermissionModalVisibility] = useState(false);
	const [createModelModalVisibility, setCreateModelModalVisibility] = useState(false);
	const params = useParams();
	const history = useHistory();

	useEffect(() => {
		(async () => {
			if (models) {
				for (let model of models) {
					if (model._id === params.model_id) {
						await setSelectedModel(model);
					}
				}
			}
		})();
	}, [models, params]);

	if (loading || worldLoading) {
		return <LoadingView />;
	}

	return (
		<>
			<Row>
				<Col span={4}>
					{currentWorld.canAddModels && (
						<>
							<Button
								className={"margin-lg"}
								type={"primary"}
								onClick={async () => {
									await setCreateModelModalVisibility(true);
								}}
							>
								Create Model
							</Button>
							<CreateModelModal
								visibility={createModelModalVisibility}
								setVisibility={async (visibility) => setCreateModelModalVisibility(visibility)}
							/>
						</>
					)}
					<h1 className={"margin-lg-left"}>Models</h1>
					<div className={"margin-lg"}>
						<List
							dataSource={models || []}
							locale={{ emptyText: <>No Models</> }}
							renderItem={(model) => {
								return (
									<List.Item key={model._id}>
										<a
											onClick={async () =>
												history.push(`/ui/world/${currentWorld._id}/model/${model._id}/view`)
											}
										>
											{model.name}
										</a>
									</List.Item>
								);
							}}
						/>
					</div>
				</Col>
				<Col span={16}>
					{selectedModel && (
						<>
							<Switch>
								<Route path={`${match.path}/edit`}>
									<ModelEdit model={selectedModel} />
								</Route>
								<Route path={`${match.path}/view`}>
									<div>
										<ModelContent model={selectedModel} />
									</div>
								</Route>
							</Switch>
						</>
					)}
				</Col>
				<Col span={4}>
					{selectedModel && (
						<div className={"margin-lg"}>
							<a
								title={"View permissions for this model"}
								onClick={async () => {
									await setPermissionModalVisibility(true);
								}}
							>
								<TeamOutlined style={{ fontSize: "20px" }} />
							</a>
							<PermissionModal
								visibility={permissionModalVisibility}
								setVisibility={setPermissionModalVisibility}
								subject={selectedModel}
								subjectType={MODEL}
								refetch={refetch}
							/>
						</div>
					)}
				</Col>
			</Row>
		</>
	);
};
