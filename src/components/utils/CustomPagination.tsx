import { makeStyles } from '@material-ui/core';
import { useGridSlotComponentProps } from '@material-ui/data-grid';
import Pagination from '@material-ui/lab/Pagination';
import * as React from 'react';

const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
});

export default function CustomPagination() {
  const { state, apiRef } = useGridSlotComponentProps();
  const classes = useStyles();

  return (
    <Pagination
      className={classes.root}
      color="primary"
      count={state.pagination.pageCount}
      page={state.pagination.page + 1}
      onChange={(event, value) => apiRef.current.setPage(value - 1)}
    />
  );
}
