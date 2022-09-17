import React, { useState } from "react";
import useCurrentWorld from "../hooks/world/useCurrentWorld";
import PermissionEditor from "./permissions/PermissionEditor";
import useRenameWorld from "../hooks/world/useRenameWorld";
import { WORLD } from "@rpgtools/common/src/type-constants";
import LoadingView from "./LoadingView";
import useLoad5eContent from "../hooks/world/useLoad5eContent";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "./widgets/PrimaryButton";
import TextInput from "./widgets/input/TextInput";
import FullScreenModal from "./widgets/FullScreenModal";
import PrimaryCheckbox from "./widgets/PrimaryCheckbox";
import ColumnedContent from "./widgets/ColumnedContent";

export default function WorldSettings() {
	const { currentWorld, loading: currentWorldLoading, refetch } = useCurrentWorld();
	const [newName, setNewName] = useState<string>();
	const { renameWorld, loading } = useRenameWorld();
	const { load5eContent, loading: contentLoading } = useLoad5eContent();
	const [getCC, setGetCC] = useState<boolean>();
	const [getTob, setGetTob] = useState<boolean>();
	const navigate = useNavigate();

	if (currentWorldLoading) {
		return <LoadingView />;
	}

	if (!currentWorld) {
		return <div>404 - World not found</div>;
	}

	return (
		<div className="margin-md-left margin-md-top padding-lg-bottom">
			<h1>Settings for {currentWorld.name}</h1>
			<hr />

			<ColumnedContent className={"margin-lg-top margin-lg-bottom"} childrenSizes={['25%', '50%', '25%']}>
				<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
					<div className={"margin-lg-top"}>
						<h2>Permissions</h2>
						<div className={"margin-lg-top"}>
							<PermissionEditor subject={currentWorld} subjectType={WORLD} refetch={async () => {await refetch()}} />
						</div>
					</div>

					{currentWorld.canWrite && (
						<>
							<div className={"margin-lg-top"}>
								<h2>Rename World</h2>
								<div style={{ display: "flex" }} className={"margin-lg-top"}>
									<div className="margin-md-right">New Name:</div>
									<div>
										<TextInput
											id={'newWorldNameInput'}
											value={newName}
											onChange={async (e) => {
												await setNewName(e.target.value);
											}}
										/>
									</div>
								</div>
								<PrimaryButton
									className={"margin-md-top"}
									onClick={async () => {
										await renameWorld({worldId: currentWorld._id, newName});
									}}
									loading={loading}
								>
									Submit
								</PrimaryButton>
							</div>
							<div className={"margin-lg-top"}>
								<FullScreenModal title={"Loading 5e content ..."} visible={contentLoading} closable={false} >
									<LoadingView />
								</FullScreenModal>
								<h2>Load 5e Content</h2>
								<div className={"margin-lg"}>
									<PrimaryCheckbox checked={getCC} onChange={(checked) => setGetCC(checked)}>
										Creature Codex
									</PrimaryCheckbox>
									<PrimaryCheckbox checked={getTob} onChange={(checked) => setGetTob(checked)}>
										Tome of Beasts
									</PrimaryCheckbox>
								</div>
								<div className={"margin-lg-top"}>
									<PrimaryButton
										loading={contentLoading}
										onClick={async () => {
											await load5eContent({
												worldId: currentWorld._id,
												creatureCodex: getCC,
												tomeOfBeasts: getTob,
											});
											navigate(
												`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`
											);
										}}
									>
										Load
									</PrimaryButton>
								</div>
							</div>
						</>
					)}
				</div>
			</ColumnedContent>

		</div>
	);
};
