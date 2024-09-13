import React, {useState} from "react";
import useMoveFolder from "../../hooks/wiki/useMoveFolder.js";
import SelectFolder from "../select/SelectFolder.js";
import {WikiFolder} from "../../types.js";
import FullScreenModal from "../widgets/FullScreenModal.js";
import InputForm from "../widgets/input/InputForm.js";
import FormItem from "../widgets/input/FormItem.js";

interface MoveFolderModalProps {
	folder: WikiFolder;
	visibility: boolean;
	setVisibility: (visibility: boolean) => any;
}

export default function MoveFolderModal({ folder, visibility, setVisibility }: MoveFolderModalProps) {
	const [newParent, setNewParent] = useState(null);
	const { moveFolder, errors, loading } = useMoveFolder(async () => {
		await setVisibility(false);
	});

	return (
		<FullScreenModal
			title={`Move ${folder.name}`}
			visible={visibility}
			setVisible={setVisibility}
		>

			<InputForm
				loading={loading}
				errors={errors}
				onSubmit={async () => {
					await moveFolder({
						folderId: folder._id,
						parentFolderId: newParent?._id,
					});
				}}
			>
				<FormItem label={"New Parent"} >
					<SelectFolder onChange={(newFolder) => setNewParent(newFolder)}/>
				</FormItem>
			</InputForm>
		</FullScreenModal>
	);
};
