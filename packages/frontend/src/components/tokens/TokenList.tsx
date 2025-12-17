import React from "react";
import TextInput from "../widgets/input/TextInput";
import useTokenIcons from "../../hooks/tokens/useTokenIcons";
import ItemList from "../widgets/ItemList";
import { TokenIcon } from "../../types";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton";
import useDeleteTokenIcon from "../../hooks/tokens/useDeleteTokenIcon";

export interface TokenListProps {
    onSelect?: (token: TokenIcon) => void;
}

const TokenList: React.FC<TokenListProps> = ({ onSelect }: TokenListProps) => {
	const [filter, setFilter] = React.useState<string>("");
    const { data, loading } = useTokenIcons();
	const {deleteTokenIcon} = useDeleteTokenIcon();
	const tokenIcons = data?.docs || [];

    return (
        <div>
            <TextInput
					placeholder="Filter token icons..."
					onChange={(e) => {
						setFilter(e.target.value);
					}}
				/>
				{loading ? (
					<div>Loading token icons...</div>
				) : tokenIcons.length === 0 ? (
					<div style={{ color: "#999" }}>No token icons available</div>
				) : (
					<ItemList>
						{tokenIcons.filter(tokenIcon => tokenIcon.name?.toLowerCase().includes(filter.toLowerCase())).map((tokenIcon) => (
							<div
								key={tokenIcon._id}
								onClick={() => onSelect && onSelect(tokenIcon)}
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
								<div><PrimaryDangerButton onClick={function () {
									deleteTokenIcon({ tokenIconId: tokenIcon._id});
								} }>Delete</PrimaryDangerButton></div>
							</div>
						))}
					</ItemList>
				)}

        </div>
        
    );
};

export default TokenList;