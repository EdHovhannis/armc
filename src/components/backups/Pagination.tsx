import { Grid } from '@material-ui/core';
import { Pagination as PaginationBase } from '@sds-eng/base';
import * as React from 'react';

interface IPagination {
  totalPageCount: number;
  currentPage: number;
  onPageChange: (value: number) => void;
}

export const Pagination: React.FC<IPagination> = ({ totalPageCount, currentPage, onPageChange }: IPagination) => {
  return (
    <Grid container justifyContent="flex-end" style={{ padding: 10 }}>
      <PaginationBase totalPageCount={totalPageCount} currentPage={currentPage} onPageChange={(value: number) => onPageChange(value)} />
    </Grid>
  );
};
