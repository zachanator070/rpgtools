import React, { useEffect, useState } from "react";
import useGetModels from "../../hooks/model/useGetModels";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import PermissionModal from "../modals/PermissionModal";
import { MODEL } from "@rpgtools/common/src/type-constants";
import LoadingView from "../LoadingView";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import CreateModelModal from "./CreateModelModal";
import ModelEdit from "./ModelEdit";
import ModelContent from "./ModelContent";
import { useParams, useHistory } from "react-router-dom";
import {Model} from "../../types";
import ColumnedContent from "../widgets/ColumnedContent";
import PrimaryButton from "../widgets/PrimaryButton";
import ItemList from "../widgets/ItemList";
import PeopleIcon from "../widgets/icons/PeopleIcon";

export default function ModelView() {
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
		<ColumnedContent>
			<div>
				{currentWorld.canAddModels && (
					<>
						<PrimaryButton
							className={"margin-lg"}
							onClick={async () => {
								await setCreateModelModalVisibility(true);
							}}
						>
							Create Model
						</PrimaryButton>
						<CreateModelModal
							visibility={createModelModalVisibility}
							setVisibility={async (visibility) => setCreateModelModalVisibility(visibility)}
						/>
					</>
				)}
				<h1 className={"margin-lg-left"}>Models</h1>
				<div className={"margin-lg"}>
					<ItemList>
						{models.map((model) => {
							return (
								<a
									onClick={async () =>
										history.push(`/ui/world/${currentWorld._id}/model/${model._id}/view`)
									}
								>
									{model.name}
								</a>
							);
						})}
					</ItemList>
				</div>
			</div>

			<div>
				{selectedModel && (
						<>
							<div className={"margin-lg"}>
								<Switch>
									<Route path={`${match.path}/edit`}>
										<h1>Edit {selectedModel.name}</h1>
									</Route>
									<Route path={`${match.path}/view`}>
										<h1>{selectedModel.name}</h1>
									</Route>
								</Switch>

							</div>
							<Switch>
								<Route path={`${match.path}/edit`}>
									<ModelEdit model={selectedModel} />
								</Route>
								<Route path={`${match.path}/view`}>
									<ModelContent model={selectedModel} />
								</Route>
							</Switch>
						</>


				)}
			</div>
			<div className={"margin-lg"}>
				{selectedModel && (
					<>
						<a
							title={"View permissions for this model"}
							onClick={async () => {
								await setPermissionModalVisibility(true);
							}}
						>
							<PeopleIcon/>
						</a>
						<PermissionModal
							visibility={permissionModalVisibility}
							setVisibility={async (visibility: boolean) => setPermissionModalVisibility(visibility)}
							subject={selectedModel}
							subjectType={MODEL}
							refetch={async () => await refetch({})}
						/>
					</>
				)}
			</div>
		</ColumnedContent>
	);
};
