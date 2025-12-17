import React, { CSSProperties} from "react";
import { TokenIcon } from "../../types";
import FullScreenModal from "../widgets/FullScreenModal";
import TokenList from "../tokens/TokenList";
import CreateTokenForm from "../tokens/CreateTokenForm";

interface ManageTokenIconsProps {
	onChange?: (tokenIcon: TokenIcon) => Promise<any>;
	style?: CSSProperties;
	visible: boolean;
	setVisible: (visible: boolean) => Promise<void>;
}

export default function ManageTokenIcons({ onChange, style, visible, setVisible }: ManageTokenIconsProps) {

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
				<CreateTokenForm/>
			</div>
		
			<div style={{ ...style, display: "flex", flexDirection: "column", gap: "0.5em" }}>
				<h2>Select Existing Icons</h2>
				<TokenList
					onSelect={async (tokenIcon) => {
						await handleSelectTokenIcon(tokenIcon);
					}}
				/>
			</div>
		</FullScreenModal>
	);
}
