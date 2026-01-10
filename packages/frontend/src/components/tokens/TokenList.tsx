import React from "react";
import useTokenIcons from "../../hooks/tokens/useTokenIcons";
import { TokenIcon } from "../../types";
import useDeleteTokenIcon from "../../hooks/tokens/useDeleteTokenIcon";
import ListTable, { ColumnDefinition } from "../widgets/ListTable";
import { useParams } from "react-router-dom";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton";
import DeleteIcon from "../widgets/icons/DeleteIcon";


export interface TokenListProps {
    onSelect?: (token: TokenIcon) => void;
	allowDelete?: boolean;
}

export default function TokenList({ onSelect, allowDelete=false }: TokenListProps) {
	const { world_id } = useParams();
    const { data, refetch, loading } = useTokenIcons();
	const {deleteTokenIcon} = useDeleteTokenIcon();

	const columns: ColumnDefinition<TokenIcon>[] = [
		{
			field: "name",
			title: "Name",
			searchable: true,
		},
		{
			field: "image._id",
			title: "Image",
			render: (value: string, record: TokenIcon) => (
				<img
					key={value}
					src={`/images/${record.image.icon.chunks[0].fileId}`}
					alt={record.name || "Token Icon"}
					style={{ width: 50, height: 50, objectFit: "contain", flexShrink: 0, cursor: onSelect ? "pointer" : "default" }}
					onClick={() => {
						if (onSelect) {
							onSelect(record);
						}
					}}
				/>),
		},	
	];
	if (allowDelete) {
		columns.push({
			field: "_id",
			title: "Delete",
			render: (_: any, record: TokenIcon) => (
				<PrimaryDangerButton key={record._id} onClick={async () => await deleteTokenIcon({tokenIconId: record._id})}><DeleteIcon /></PrimaryDangerButton>
			),
		});
	}
    return (
        <ListTable<TokenIcon> 
			data={data?.docs || []}
			totalDocs={data?.totalDocs}
			columns={columns}
			fetchData={async (filters, page) => {
				await refetch({
					worldId: world_id,
					name: filters.name,
					page: page,
				});
			}}
		/>
    );
};