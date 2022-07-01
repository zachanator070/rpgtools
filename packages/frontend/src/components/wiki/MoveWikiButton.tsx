import React, { useState } from "react";
import { Modal, Button } from "antd";
import { SelectFolder } from "../select/SelectFolder";
import { useMoveWiki } from "../../hooks/wiki/useMoveWiki";
import {WikiPage} from "../../types";

interface MoveWikiButtonProps {
	wikiPage: WikiPage;
}

export const MoveWikiButton = ({ wikiPage }: MoveWikiButtonProps) => {
	const [newFolder, setNewFolder] = useState<string>();
	const [moveModalVisibility, setMoveModalVisibility] = useState(false);
	const { moveWiki } = useMoveWiki();

	return (
		<span className={"margin-lg"}>
			<Modal
				visible={moveModalVisibility}
				title={`Move ${wikiPage.name}`}
				footer={null}
				onCancel={() => setMoveModalVisibility(false)}
			>
				New Folder: <SelectFolder onChange={async (folderId: string) => setNewFolder(folderId)} />
				<div className={"margin-lg"}>
					<Button
						type={"primary"}
						onClick={async () => {
							await moveWiki({ wikiId: wikiPage._id, folderId: newFolder });
							await setMoveModalVisibility(false);
						}}
					>
						Move Wiki
					</Button>
				</div>
			</Modal>
			<Button type="primary" onClick={() => setMoveModalVisibility(true)}>
				Move Wiki
			</Button>
		</span>
	);
};
