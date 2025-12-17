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

export default function SelectTokenModal({ onChange, style, visible, setVisible }: ManageTokenIconsProps) {

	const handleSelectTokenIcon = async (tokenIcon: TokenIcon) => {
		if (onChange) {
			await onChange(tokenIcon);
		}
	};

	return (
		<FullScreenModal
			title={"Select Icon"}
			visible={visible}
			setVisible={setVisible}
		>
			<TokenList
				onSelect={async (tokenIcon) => {
					await handleSelectTokenIcon(tokenIcon);
				}}
			/>
		</FullScreenModal>
	);
}
