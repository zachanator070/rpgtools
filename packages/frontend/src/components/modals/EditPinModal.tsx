import React from "react";
import useUpdatePin from "../../hooks/map/useUpdatePin";
import useDeletePin from "../../hooks/map/useDeletePin";
import SelectWiki from "../select/SelectWiki";
import usePins from "../../hooks/map/usePins";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/InputForm";
import {PLACE} from "@rpgtools/common/src/type-constants";
import FormItem from "../widgets/FormItem";
import DangerButton from "../widgets/DangerButton";

interface EditPinModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
	pinId: string;
}

export default function EditPinModal({ visibility, setVisibility, pinId }: EditPinModalProps) {

	const {pins, loading} = usePins({});
	const { updatePin, loading: updateLoading, errors } = useUpdatePin();
	const { deletePin, loading: deleteLoading } = useDeletePin();

	if (loading) {
		return <></>;
	}

	let pinBeingEdited = null;
	let possiblePins = pins.docs;
	for (let pin of possiblePins) {
		if (pin._id === pinId) {
			pinBeingEdited = pin;
		}
	}

	return (
		<div>
			<FullScreenModal
				title="Edit Pin"
				visible={visibility}
				setVisible={setVisibility}
			>
				<InputForm
					errors={errors}
					loading={updateLoading || deleteLoading}
					onSubmit={async ({page}) => {
						await updatePin({pinId, pageId: page._id});
						await setVisibility(false);
					}}
				>
					<FormItem name="page" label="Page" >
						<SelectWiki types={[PLACE]} />
					</FormItem>
				</InputForm>
			</FullScreenModal>
			<DangerButton
				loading={updateLoading || deleteLoading}
				onClick={async () => {
					await deletePin({pinId});
					await setVisibility(false);
				}}
			>
				Delete
			</DangerButton>
		</div>
	);
};
