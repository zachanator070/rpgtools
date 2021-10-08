export interface ApiHookResponse<TData, TVariables=void> {
    loading: boolean;
    errors: string[];
    data: TData;
    queryName: string;
}

