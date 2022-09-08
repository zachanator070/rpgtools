import React, {useEffect, useState} from "react";
import useUpdatePin from "../../hooks/map/useUpdatePin";
import useDeletePin from "../../hooks/map/useDeletePin";
import SelectWiki from "../select/SelectWiki";
import usePins from "../../hooks/map/usePins";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/input/InputForm";
import {PLACE} from "@rpgtools/common/src/type-constants";
import FormItem from "../widgets/input/FormItem";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton";
import {Pin, WikiPage} from "../../types";
import NumberInput from "../widgets/input/NumberInput";
import Toggle from "../widgets/Toggle";
import DropdownSelect from "../widgets/DropdownSelect";
import {PIN_BUILT_IN_ICONS} from "@rpgtools/common/src/pin-constants";
import BuiltInPinIcon from "../map/BuiltInPinIcon";
import ColorInput from "../widgets/input/ColorInput";
import ImageInput from "../widgets/input/ImageInput";
import useCreateImage from "../../hooks/wiki/useCreateImage";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";

interface EditPinModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
	pin: Pin;
}

export default function EditPinModal({ visibility, setVisibility, pin }: EditPinModalProps) {

	const [pinPage, setPinPage] = useState<WikiPage>(pin.page);
	const [pinSize, setPinSize] = useState<number>(pin.icon.size);
	const [useBuiltInIcon, setUseBuiltInIcon] = useState<boolean>(pin.icon.image === null);
	const [builtInIconType, setBuiltInIconType] = useState(pin.icon.builtInIcon);
	const [iconColor, setIconColor] = useState<string>(pin.icon.color);
	const [newIconImage, setNewIconImage] = useState(null);
	const { updatePin, loading: updateLoading, errors } = useUpdatePin();
	const { deletePin, loading: deleteLoading } = useDeletePin();
	const { createImage } = useCreateImage();
	const {currentWorld} = useCurrentWorld();

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
						let pinImageId = pin.icon.image?._id;
						if (newIconImage) {
							const coverUploadResult = await createImage({file: newIconImage, worldId: currentWorld._id, chunkify: false});
							pinImageId = coverUploadResult._id;
						} else if (newIconImage === null) {
							pinImageId = null;
						}
						await updatePin({
							pinId: pin._id,
							pageId: pinPage ? pinPage._id : null,
							size: pinSize,
							color: iconColor,
							builtInIcon: builtInIconType,
							imageId: pinImageId
						});
						await setVisibility(false);
					}}
					buttonText={'Save'}
				>
					<FormItem label="Page">
						<SelectWiki types={[PLACE]} onChange={(page) => setPinPage(page)}/>
					</FormItem>
					<FormItem label={'Size'}>
						<NumberInput onChange={setPinSize} value={pinSize}/>
					</FormItem>
					<FormItem label={'Use Built-In Icon'}>
						<Toggle
							checkedChildren={<></>}
							unCheckedChildren={<></>}
							onChange={(checked) => {
								if (checked) {
									setNewIconImage(null);
									setIconColor(pin.icon.color);
									setBuiltInIconType(pin.icon.builtInIcon);
								} else {
									setIconColor(null);
									setBuiltInIconType(null);
									setNewIconImage(null);
								}
								setUseBuiltInIcon(checked);
							}}
							defaultChecked={pin.icon.builtInIcon !== null}/>
					</FormItem>
					{useBuiltInIcon ?
						<>
							<FormItem label={'Icon'}>
								<DropdownSelect
									onChange={setBuiltInIconType}
									defaultValue={pin.icon.builtInIcon}
									options={PIN_BUILT_IN_ICONS.map(iconType => {
										return {
											value: iconType,
											label: iconType
										};
									})}
								/>
							</FormItem>
							<FormItem label={'Color'}>
								<ColorInput value={iconColor} onChange={async (e) => {
									const value = e.target.value;
									await setIconColor(value);
								}} />
							</FormItem>
							<FormItem label={'Preview'}>
								<BuiltInPinIcon type={builtInIconType} size={pinSize} color={iconColor}/>
							</FormItem>
						</>
							:
						<>
							<FormItem label={'Icon File'}>
								<ImageInput onChange={setNewIconImage} initialImage={pin.icon.image} buttonText={'Select Icon'}/>
							</FormItem>
						</>
					}
				</InputForm>
				<PrimaryDangerButton
					loading={updateLoading || deleteLoading}
					onClick={async () => {
						await deletePin({pinId: pin._id});
						await setVisibility(false);
					}}
				>
					Delete
				</PrimaryDangerButton>
			</FullScreenModal>
		</div>
	);
};
