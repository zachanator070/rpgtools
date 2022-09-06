import React, { useState } from "react";
import SelectFolder from "../select/SelectFolder";
import useMoveWiki from "../../hooks/wiki/useMoveWiki";
import {WikiPage} from "../../types";
import FullScreenModal from "../widgets/FullScreenModal";
import PrimaryButton from "../widgets/PrimaryButton";

interface MoveWikiButtonProps {
	wikiPage: WikiPage;
}

export default function MoveWikiButton({ wikiPage }: MoveWikiButtonProps) {
	const [newFolder, setNewFolder] = useState<string>();
	const [moveModalVisibility, setMoveModalVisibility] = useState(false);
	const { moveWiki } = useMoveWiki();

	return (
		<>
			<FullScreenModal
				visible={moveModalVisibility}
				title={`Move ${wikiPage.name}`}
				setVisible={() => setMoveModalVisibility(false)}
			>
				New Folder: <SelectFolder onChange={async (folder) => setNewFolder(folder._id)} />
				<div className={"margin-lg"}>
					<PrimaryButton
						onClick={async () => {
							await moveWiki({ wikiId: wikiPage._id, folderId: newFolder });
							await setMoveModalVisibility(false);
						}}
					>
						Move Wiki
					</PrimaryButton>
				</div>
			</FullScreenModal>
			<PrimaryButton onClick={() => setMoveModalVisibility(true)}>
				Move Wiki
			</PrimaryButton>
		</>
	);
};
