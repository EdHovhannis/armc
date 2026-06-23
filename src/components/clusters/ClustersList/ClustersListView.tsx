import { Paper, Table, TableContainer, TablePagination } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import * as React from 'react';

import { AddFab } from '../../utils/AddFab';
import { FilterMenuItem } from '../../utils/FilterMenu';
import { Loader } from '../../utils/Loader';
import { ClustersModal } from '../ClustersModal';
import { Cluster, Order } from '../types';

import ClustersListBody from './ClustersListBody';
import ClustersListDelete from './ClustersListDelete';
import ClustersListFilter from './ClustersListFilter';
import ClustersListHead from './ClustersListHead';
import ClustersListToolbar from './ClustersListToolbar';

interface IClustersListView {
  originalClusters: Cluster[];
  clusters: Cluster[];
  clusterId: number | null;
  order: Order;
  orderBy: keyof Cluster;
  page: number;
  rowsPerPage: number;
  filter: FilterMenuItem[] | undefined;
  search: string;
  modalVisible: boolean;
  loading: boolean;
  deleteId: number | null;
  classes: ClassNameMap;
  handleRequestSort(property: keyof Cluster | null): void;
  handleChangePage(_: unknown, page: number): void;
  handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>): void;
  handleFilter(filters: FilterMenuItem[]): any;
  handleSearch(event: React.ChangeEvent<HTMLInputElement>): void;
  handleModal(visible: boolean): void;
  handleSetCluster(id: number | null): void;
  handleSetDelete(id: number | null): void;
  deleteCluster(): void;
  stableSort<T>(array: T[], comparator: (a: T, b: T) => number): T[];
  getComparator<Key extends keyof Cluster>(order: Order, orderBy: Key): (a: Cluster, b: Cluster) => number;
  getClusters(): void;
}

const ClustersListView: React.FC<IClustersListView> = ({
  originalClusters,
  clusters,
  clusterId,
  order,
  orderBy,
  page,
  rowsPerPage,
  filter,
  search,
  modalVisible,
  loading,
  deleteId,
  classes,
  handleRequestSort,
  handleChangePage,
  handleChangeRowsPerPage,
  handleFilter,
  handleSearch,
  handleModal,
  handleSetCluster,
  handleSetDelete,
  deleteCluster,
  stableSort,
  getComparator,
  getClusters,
}) => {
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <ClustersListFilter originalClusters={originalClusters} filter={filter} onChange={handleFilter} />
          <Paper>
            <ClustersListToolbar search={search} handleSearch={handleSearch} />
            <TableContainer>
              <Table className={classes.table}>
                <ClustersListHead order={order} orderBy={orderBy} classes={classes} handleRequestSort={handleRequestSort} />
                <ClustersListBody
                  clusterts={clusters}
                  order={order}
                  orderBy={orderBy}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  handleSetCluster={handleSetCluster}
                  handleSetDelete={handleSetDelete}
                  stableSort={stableSort}
                  getComparator={getComparator}
                />
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100]}
              component="div"
              count={clusters.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Кластеров на странице:"
              className={classes.pagination}
            />
          </Paper>
          <AddFab title="Создать кластер" onClick={() => handleModal(true)} />
          <ClustersModal visible={modalVisible} clusterId={clusterId} handleVisible={handleModal} getClusters={getClusters} />
          <ClustersListDelete visible={deleteId !== null} onConfirm={deleteCluster} onCancel={handleSetDelete} />
        </>
      )}
    </>
  );
};

export default ClustersListView;
