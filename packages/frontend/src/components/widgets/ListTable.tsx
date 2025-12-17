import { Table } from "antd";
import { ColumnProps, TablePaginationConfig } from "antd/lib/table";
import React from "react";
import TextInput from "./input/TextInput";

export interface ColumnDefinition<T> {
    field: string;
    title: string;
    render?: (value: any, record: T) => React.ReactNode;
    searchable?: boolean;
}

interface ListTableProps<Entity> {
    columns: ColumnDefinition<Entity>[];
    fetchData: (filters: Record<string, any>, page: number) => Promise<any>;
    data: Entity[];
    title?: string;
    totalDocs?: number;
    searchable?: boolean;
}

export default function ListTable<Entity>({ title, columns, fetchData, data, totalDocs }: ListTableProps<Entity>) {

    const [filters, setFilters] = React.useState<Record<string, any>>({});
    const [paginationConfig, setPaginationConfig] = React.useState<TablePaginationConfig>({
        showSizeChanger: false,
        total: totalDocs || 0,
        current: 1,
    });
    React.useEffect(() => {
        setPaginationConfig({
            ...paginationConfig,
            total: totalDocs || 0,
        });
    }, [totalDocs]);

    function capitalizeFirstLetter(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const tableColumns: ColumnProps<Entity>[] = columns.map(column => ({ 
        title: capitalizeFirstLetter(column.title), 
        dataIndex: column.field, 
        render: column.render
    }));

    const searchField = columns.find(col => col.searchable)?.field;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {searchField && <div>  
                <TextInput 
                    placeholder="Search..." 
                    onChange={async (e) => {
                        const filters = { [searchField]: e.target.value };
                        setFilters(filters);
                        setPaginationConfig({
                            ...paginationConfig,
                            current: 1,
                        });
                        await fetchData(filters, 1);
                    }} 
                />
            </div>}
            <Table 
                columns={tableColumns} 
                pagination={paginationConfig} 
                dataSource={data as any[]} 
                rowKey="_id"
                onChange={async (pagination) => {
                    setPaginationConfig(pagination);
                    await fetchData(filters, pagination.current);
                }}
            />
        </div>
    );
}