import React from "react";
import useMoveFolder from "../../hooks/wiki/useMoveFolder";
import SelectFolder from "../select/SelectFolder";
import {WikiFolder} from "../../types";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/InputForm";
import FormItem from "../widgets/FormItem";

interface MoveFolderModalProps {
	folder: WikiFolder;
	visibility: boolean;
	setVisibility: (visibility: boolean) => any;
}

export default function MoveFolderModal({ folder, visibility, setVisibility }: MoveFolderModalProps) {
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
				onSubmit={async ({mewParentId}) => {
					await moveFolder({
						folderId: folder._id,
						parentFolderId: mewParentId,
					});
				}}
			>
				<FormItem name="newParentId" label={"New Parent"} >
					<SelectFolder/>
				</FormItem>
			</InputForm>
		</FullScreenModal>
	);
};
