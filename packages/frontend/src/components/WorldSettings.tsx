import React, { useState } from "react";
import useCurrentWorld from "../hooks/world/useCurrentWorld";
import PermissionEditor from "./permissions/PermissionEditor";
import useRenameWorld from "../hooks/world/useRenameWorld";
import { WORLD } from "@rpgtools/common/src/type-constants";
import LoadingView from "./LoadingView";
import useLoad5eContent from "../hooks/world/useLoad5eContent";
import { useHistory } from "react-router-dom";
import PrimaryButton from "./generic/PrimaryButton";
import TextInput from "./generic/TextInput";
import FullScreenModal from "./generic/FullScreenModal";
import PrimaryCheckbox from "./generic/PrimaryCheckbox";

export default function WorldSettings() {
	const { currentWorld, loading: currentWorldLoading, refetch } = useCurrentWorld();
	const [newName, setNewName] = useState<string>();
	const { renameWorld, loading } = useRenameWorld();
	const { load5eContent, loading: contentLoading } = useLoad5eContent();
	const [getCC, setGetCC] = useState<boolean>();
	const [getTob, setGetTob] = useState<boolean>();
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
			<div className={"margin-lg-top"} style={{display: 'flex', flexWrap: 'nowrap'}}>
				<div style={{flexGrow: 4}}/>
				<div style={{flexGrow: 16}}>
					<h2>Permissions</h2>
					<div className={"margin-lg-top"}>
						<PermissionEditor subject={currentWorld} subjectType={WORLD} refetch={async () => {await refetch()}} />
					</div>
				</div>
				<div style={{flexGrow: 4}}/>
			</div>

			{currentWorld.canWrite && (
				<>
					<div className={"margin-lg-top"} style={{display: 'flex', flexWrap: 'nowrap'}}>
						<div style={{flexGrow: 4}}/>
						<div style={{flexGrow: 16}}>
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
						<div style={{flexGrow: 4}}/>
					</div>
					<div className={"margin-lg-top"} style={{display: 'flex', flexWrap: 'nowrap'}}>
						<div style={{flexGrow: 4}}/>
						<div style={{flexGrow: 16}}>
							<FullScreenModal title={"Loading 5e content ..."} visible={contentLoading} closable={false} >
								<LoadingView />
							</FullScreenModal>
							<h2>Load 5e Content</h2>
							<div className={"margin-lg"}>
								<PrimaryCheckbox onChange={(checked) => setGetCC(checked)}>
									Creature Codex
								</PrimaryCheckbox>
								<PrimaryCheckbox onChange={(checked) => setGetTob(checked)}>
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
										history.push(
											`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`
										);
									}}
								>
									Load
								</PrimaryButton>
							</div>
						</div>
						<div style={{flexGrow: 4}}/>
					</div>
				</>
			)}
		</div>
	);
};
