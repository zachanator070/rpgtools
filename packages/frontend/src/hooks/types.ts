export interface GQLResult<TData> {
	loading: boolean;
	errors: string[];
	data: TData;
	queryName: string;
}
