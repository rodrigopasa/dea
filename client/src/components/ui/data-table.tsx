import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTableProps<T> {
  columns: {
    accessor: keyof T | string;
    header: string;
    cell?: (item: T) => React.ReactNode;
  }[];
  data: T[];
  pagination?: {
    pageIndex: number;
    pageCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  pagination,
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando dados...</div>
      </div>
    );
  }

  const renderCell = (item: T, accessor: keyof T | string) => {
    const column = columns.find((col) => col.accessor === accessor);
    if (column?.cell) {
      return column.cell(item);
    }
    
    // Handle nested properties with dot notation
    if (typeof accessor === 'string' && accessor.includes('.')) {
      const props = accessor.split('.');
      let value: any = item;
      for (const prop of props) {
        value = value?.[prop];
      }
      return value;
    }
    
    return item[accessor as keyof T];
  };

  return (
    <div className="w-full overflow-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessor as string} className="font-medium">
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nenhum resultado encontrado.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index} className="border-b border-dark-border hover:bg-dark-surface-2">
                {columns.map((column) => (
                  <TableCell key={column.accessor as string}>
                    {renderCell(item, column.accessor)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.pageCount > 1 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-gray-400">
            Mostrando {pagination.pageIndex * pagination.pageSize + 1}-
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} de{" "}
            {data.length} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-dark-border"
              onClick={() => pagination.onPageChange(0)}
              disabled={pagination.pageIndex === 0}
            >
              <span className="sr-only">Primeira página</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-dark-border"
              onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
              disabled={pagination.pageIndex === 0}
            >
              <span className="sr-only">Página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Página {pagination.pageIndex + 1} de {pagination.pageCount}
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-dark-border"
              onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
              disabled={pagination.pageIndex === pagination.pageCount - 1}
            >
              <span className="sr-only">Próxima página</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-dark-border"
              onClick={() => pagination.onPageChange(pagination.pageCount - 1)}
              disabled={pagination.pageIndex === pagination.pageCount - 1}
            >
              <span className="sr-only">Última página</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
