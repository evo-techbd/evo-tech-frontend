import { ColumnDef } from "@tanstack/react-table"
import { UniqueIdentifier } from "@dnd-kit/core"
import { Row } from '@tanstack/react-table';


// ensure any data has an id property that's a UniqueIdentifier
export interface BaseRecord {
  id: UniqueIdentifier;
}

// Server-side pagination props
export interface ServerSidePaginationProps {
  pageCount: number;
  currentPage: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

// props type for the DataTable component
export interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  enableRowSelection?: boolean;
  enableSelectedRowsCount?: boolean;
  onDataChange?: (newData: TData[]) => void;
  defaultPageSize?: number;
  serverSidePagination?: ServerSidePaginationProps; // Server-side pagination (optional - if not provided, uses client-side pagination)
}


export type DataTableRowAction<TData> = {
  row: Row<TData>;
  type: "delete";
}
