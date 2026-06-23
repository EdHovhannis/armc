import { TablePagination } from '@material-ui/core';
import * as React from 'react';
import { FC } from 'react';

interface TablePaginationComponentProps {
  count: number;
  page: number;
  rowsPerPageOptions: number[];
  rowsPerPage: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TablePaginationComponent: FC<TablePaginationComponentProps> = (props) => {
  const { count, page, rowsPerPageOptions, rowsPerPage, onChange, onRowsPerPageChange } = props;
  return (
    <TablePagination
      rowsPerPageOptions={rowsPerPageOptions}
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={(event, newPage) => onChange(event as React.ChangeEvent<unknown>, newPage)}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
};
