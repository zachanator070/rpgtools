import React from 'react';
import {Table} from "antd";

export default function FormattedTable({headers, data, scrollHeight, filters, sorting}: {headers: string[], data: any[][], scrollHeight?: number, filters?: boolean, sorting?: boolean}) {
    const columnDefinitions = [];

    for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
        const headerTitle = headers[headerIndex];
        const header = {
            title: headerTitle,
            dataIndex: headerIndex,
            key: headerIndex
        };
        columnDefinitions.push(header);
    }

    const tableRows = [];
    for(let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = {
            key: rowIndex
        };
        for (let columnIndex = 0; columnIndex < data[rowIndex].length; columnIndex++) {
            row[columnIndex] = data[rowIndex][columnIndex]
        }
        tableRows.push(row);
    }

    if (filters) {
        for (let columnIndex = 0; columnIndex < columnDefinitions.length; columnIndex++) {
            const columnDefinition = columnDefinitions[columnIndex];
            columnDefinition.filters = tableRows.map(row => {
                return {text: row[columnIndex], value: row[columnIndex]};
            });
            columnDefinition.onFilter = (value, record) => record[columnIndex] === value;
            columnDefinition.filterMultiple = false;
        }
    }

    if(sorting) {
        for (let columnIndex = 0; columnIndex < columnDefinitions.length; columnIndex++) {
            const columnDefinition = columnDefinitions[columnIndex];
            columnDefinition.sorter = (a, b) => a[columnIndex] < b[columnIndex] ? -1 : 1;
        }
    }

    return <Table
        size={"small"}
        columns={columnDefinitions}
        dataSource={tableRows}
        pagination={false}
        showHeader={false}
        scroll={scrollHeight && {y: scrollHeight}}
    />;

}