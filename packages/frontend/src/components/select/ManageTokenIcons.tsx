import React, { CSSProperties, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useTokenIcons from "../../hooks/game/useTokenIcons";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useCreateImage from "../../hooks/wiki/useCreateImage";
import useCreateTokenIcon from "../../hooks/game/useCreateTokenIcon";
import TextInput from "../widgets/input/TextInput";
import ItemList from "../widgets/ItemList";
import { TokenIcon } from "../../types";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/input/InputForm";
import FormItem from "../widgets/input/FormItem";
import ImageInput from "../widgets/input/ImageInput";
import { UploadFile } from "antd";

interface ManageTokenIconsProps {
	onChange?: (tokenIcon: TokenIcon) => Promise<any>;
	style?: CSSProperties;
	visible: boolean;
	setVisible: (visible: boolean) => Promise<void>;
}

export default function ManageTokenIcons({ onChange, style, visible, setVisible }: ManageTokenIconsProps) {
	const { world_id } = useParams();
	const { currentWorld } = useCurrentWorld();
	const { data, loading, refetch } = useTokenIcons(1);
	const [selectedImageFile, setSelectedImageFile] = useState<UploadFile<any> | undefined | null>(undefined);
	const [tokenName, setTokenName] = useState<string | undefined>(undefined);

	const { createImage, loading: imageLoading, errors: imageErrors } = useCreateImage();
	const { createTokenIcon, loading: tokenLoading, errors: tokenErrors } = useCreateTokenIcon(async () => {
		setSelectedImageFile(undefined);
		setTokenName(undefined);
		await refetch();
	});

	const tokenIcons = data?.docs || [];

	useEffect(() => {
		if (world_id) {
			refetch();
		}
	}, [world_id]);

	const handleSelectTokenIcon = async (tokenIcon: TokenIcon) => {
		if (onChange) {
			await onChange(tokenIcon);
		}
	};

	return (
		<FullScreenModal
			title={"Upload New Icon"}
			visible={visible}
			setVisible={setVisible}
		>
			<div style={{display: "flex", flexDirection: "column", gap: "1em"}}>
				<InputForm 
					loading={imageLoading || tokenLoading}
					errors={[...imageErrors, ...tokenErrors]}
					onSubmit={async () => {
						if (selectedImageFile?.originFileObj) {
							const imageResult = await createImage({
									file: selectedImageFile.originFileObj,
									worldId: currentWorld._id,
									chunkify: false,
								});
								await createTokenIcon({
									worldId: currentWorld._id,
									imageId: imageResult._id,
									name: tokenName || undefined,
								});
								setSelectedImageFile(undefined);
								setTokenName(undefined);
						}
					}}
					buttonText={"Upload Token Icon"}
				>
					<FormItem label={"Image File"} required={true}>
						<ImageInput
							revertable={false}
							buttonText={"Select Image"}
							imageList={selectedImageFile ? [selectedImageFile] : []}
							initialImage={null}
							onChange={(file) => {
								setSelectedImageFile(file);
							}}
						/>
					</FormItem>
					<FormItem label={"Token Name"}>
						<TextInput
							value={tokenName}
							onChange={(e) => setTokenName(e.target.value)}
						/>
					</FormItem>
				</InputForm>
			</div>
		
			<div style={{ ...style, display: "flex", flexDirection: "column", gap: "0.5em" }}>
				<h2>Select Existing Icons</h2>
				{loading ? (
					<div>Loading token icons...</div>
				) : tokenIcons.length === 0 ? (
					<div style={{ color: "#999" }}>No token icons available</div>
				) : (
					<ItemList>
						{tokenIcons.map((tokenIcon) => (
							<div
								key={tokenIcon._id}
								onClick={() => handleSelectTokenIcon(tokenIcon)}
								style={{
									cursor: "pointer",
									transition: "all 0.2s ease",
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
									gap: "1em",
								}}
							>
								<img
									src={`/images/${tokenIcon.image.icon.chunks[0].fileId}`}
									alt={tokenIcon.name || "Token Icon"}
									style={{ width: 50, height: 50, objectFit: "contain", flexShrink: 0 }}
								/>
								<div style={{ fontWeight: "500" }}>{tokenIcon.name || "Unnamed"}</div>
							</div>
						))}
					</ItemList>
				)}
			</div>
		</FullScreenModal>
	);
}
