import { TableCell, TableHead, TableRow, TableSortLabel } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import * as React from 'react';

import { Cluster, Order } from '../types';

interface IClustersListHead {
  order: Order;
  orderBy: keyof Cluster;
  classes: ClassNameMap;
  handleRequestSort(property: keyof Cluster | null): void;
}

interface HeadCell {
  id: keyof Cluster | null;
  label: string;
}

const ClustersListHead: React.FC<IClustersListHead> = ({ order, orderBy, classes, handleRequestSort }: IClustersListHead) => {
  const headCells: HeadCell[] = [
    {
      id: 'name',
      label: 'Наименование кластера',
    },
    {
      id: 'type',
      label: 'Тип',
    },
    {
      id: 'description',
      label: 'Описание',
    },
    {
      id: null,
      label: '',
    },
  ];

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              hideSortIcon={!headCell.id}
              onClick={() => handleRequestSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? <span className={classes.visuallyHidden}>{order === 'desc' ? 'desc' : 'asc'}</span> : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default ClustersListHead;
