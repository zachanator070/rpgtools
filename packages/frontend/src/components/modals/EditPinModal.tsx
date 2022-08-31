import React, {useEffect, useState} from "react";
import useUpdatePin from "../../hooks/map/useUpdatePin";
import useDeletePin from "../../hooks/map/useDeletePin";
import SelectWiki from "../select/SelectWiki";
import usePins from "../../hooks/map/usePins";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/InputForm";
import {PLACE} from "@rpgtools/common/src/type-constants";
import FormItem from "../widgets/FormItem";
import DangerButton from "../widgets/DangerButton";
import {Pin, WikiPage} from "../../types";

interface EditPinModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
	pinId: string;
}

export default function EditPinModal({ visibility, setVisibility, pinId }: EditPinModalProps) {

	const {pins, loading} = usePins({});
	const [pinPage, setPinPage] = useState<WikiPage>(null);
	const [pinBeingEdited, setPinBeingEdited] = useState<Pin>(null)
	const { updatePin, loading: updateLoading, errors } = useUpdatePin();
	const { deletePin, loading: deleteLoading } = useDeletePin();

	useEffect(() => {
		if (pins && pinBeingEdited) {
			let possiblePins = pins.docs;
			for (let pin of possiblePins) {
				if (pin._id === pinId) {
					setPinBeingEdited(pin);
					break;
				}
			}
			setPinPage(pinBeingEdited.page);
		}
	}, [pins, pinId, pinBeingEdited]);

	if (loading) {
		return <></>;
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
					onSubmit={async () => {
						await updatePin({pinId, pageId: pinPage._id});
						await setVisibility(false);
					}}
				>
					<FormItem label="Page">
						<SelectWiki types={[PLACE]} onChange={(page) => setPinPage(page)}/>
					</FormItem>
				</InputForm>
				<DangerButton
					loading={updateLoading || deleteLoading}
					onClick={async () => {
						await deletePin({pinId});
						await setVisibility(false);
					}}
				>
					Delete
				</DangerButton>
			</FullScreenModal>
		</div>
	);
};
