import { IconButton, TableBody, TableCell, TableRow } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import * as React from 'react';

import { Cluster, Order } from '../types';

interface IClustersListBody {
  clusterts: Cluster[];
  order: Order;
  orderBy: keyof Cluster;
  page: number;
  rowsPerPage: number;
  handleSetCluster(id: number | null): void;
  handleSetDelete(id: number | null): void;
  stableSort<T>(array: T[], comparator: (a: T, b: T) => number): T[];
  getComparator<Key extends keyof Cluster>(order: Order, orderBy: Key): (a: Cluster, b: Cluster) => number;
}

const ClustersListBody: React.FC<IClustersListBody> = ({
  clusterts,
  order,
  orderBy,
  page,
  rowsPerPage,
  handleSetCluster,
  handleSetDelete,
  stableSort,
  getComparator,
}: IClustersListBody) => {
  return (
    <TableBody>
      {stableSort(clusterts, getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row) => {
          return (
            <TableRow hover role="checkbox" key={row.name} style={{ cursor: 'pointer' }} selected={row.default}>
              <TableCell onClick={() => handleSetCluster(row.id ?? null)}>{row.name}</TableCell>
              <TableCell onClick={() => handleSetCluster(row.id ?? null)}>{row.type ?? 'Kafka'}</TableCell>
              <TableCell onClick={() => handleSetCluster(row.id ?? null)}>{row.description}</TableCell>
              <TableCell padding="checkbox">
                {!row.default && (
                  <IconButton color="primary" onClick={() => handleSetDelete(row.id ?? null)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          );
        })}
    </TableBody>
  );
};

export default ClustersListBody;
