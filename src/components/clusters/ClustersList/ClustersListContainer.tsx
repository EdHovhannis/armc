import { createStyles, makeStyles } from '@material-ui/core';
import * as _ from 'lodash';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import ClusterService from '../../../services/ClusterService';
import * as notificationActions from '../../../store/notification/Actions';
import { OPERATORS } from '../../../utils/Utils';
import { FilterMenuItem } from '../../utils/FilterMenu';
import { Cluster, Order } from '../types';

import ClustersListView from './ClustersListView';

interface ClustersListDispatchProps {
  displayError: (message: string) => void;
  displaySuccess: (message: string) => void;
}

const ClustersListContainer: React.FC<ClustersListDispatchProps> = ({ displayError, displaySuccess }: ClustersListDispatchProps) => {
  const [originalClusters, setOriginalClusters] = useState<Cluster[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [clusterId, setClusterId] = useState<number | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Cluster>('id');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const [filter, setFilter] = useState<FilterMenuItem[] | undefined>(undefined);
  const [search, setSearch] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const getClusters = () => {
    setLoading(true);
    ClusterService.getClusters(
      (clusters) => setOriginalClusters(clusters),
      (error) => displayError(error),
    ).finally(() => setLoading(false));
  };

  const deleteCluster = () => {
    if (deleteId) {
      ClusterService.deleteCluster(
        deleteId,
        () => {
          displaySuccess('Кластер успешно удален');
          getClusters();
        },
        (error) => displayError(error),
      ).finally(() => setDeleteId(null));
    }
  };

  useEffect(() => {
    getClusters();
  }, []);

  useEffect(() => {
    setClusters(originalClusters);
  }, [originalClusters]);

  useEffect(() => {
    setModalVisible(clusterId !== null);
  }, [clusterId]);

  const handleRequestSort = (property: keyof Cluster | null) => {
    if (!property) return;

    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilter = (filters: FilterMenuItem[]) => {
    let newClusters = _.cloneDeep(originalClusters);

    filters.map((f: FilterMenuItem) => {
      switch (f.operator) {
        case OPERATORS.IS:
        case OPERATORS.IN:
          newClusters = newClusters.filter((cluster: Cluster) => f.values.findIndex((row) => row.includes(cluster[f.field])) !== -1);
          break;
        case OPERATORS['IS NOT']:
        case OPERATORS['NOT IN']:
          newClusters = newClusters.filter((cluster: Cluster) => f.values.findIndex((row) => row.includes(cluster[f.field])) === -1);
          break;
      }
    });

    setClusters(newClusters);
    setFilter(filters);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newClusters = _.cloneDeep(originalClusters);
    const value = event.target.value.toLowerCase();

    if (value) {
      newClusters = newClusters.filter((cluster: Cluster) => {
        if (
          (cluster.name && cluster.name.toLowerCase().includes(value)) ||
          (cluster.description && cluster.description.toLowerCase().includes(value))
        )
          return true;
        return false;
      });
    }

    setClusters(newClusters);
    setSearch(value);
  };

  const handleModal = (visible: boolean) => {
    setModalVisible(visible);
    if (!visible) setClusterId(null);
  };

  const handleSetCluster = (id: number | null) => {
    // if (!id) return
    setClusterId(id);
  };

  const handleSetDelete = (id: number | null) => {
    // if (!id) return
    setDeleteId(id);
  };

  const descendingComparator = <T,>(a: T, b: T, orderBy: keyof T) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const getComparator = <Key extends keyof Cluster>(order: Order, orderBy: Key) => {
    return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const stableSort = <T,>(array: T[], comparator: (a: T, b: T) => number): T[] => {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const classes = makeStyles(() =>
    createStyles({
      pagination: {
        marginRight: 60,
      },
      visuallyHidden: {
        position: 'absolute',
        top: 20,
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        border: 0,
        clip: 'rect(0 0 0 0)',
        overflow: 'hidden',
      },
      table: {
        '& .MuiTableRow-root.Mui-selected': {
          backgroundColor: 'rgb(233, 245, 234)',
        },
      },
    }),
  )();

  return (
    <ClustersListView
      originalClusters={originalClusters}
      clusters={clusters}
      clusterId={clusterId}
      order={order}
      orderBy={orderBy}
      page={page}
      rowsPerPage={rowsPerPage}
      filter={filter}
      search={search}
      modalVisible={modalVisible}
      loading={loading}
      deleteId={deleteId}
      classes={classes}
      handleRequestSort={handleRequestSort}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
      handleFilter={handleFilter}
      handleSearch={handleSearch}
      handleModal={handleModal}
      handleSetCluster={handleSetCluster}
      handleSetDelete={handleSetDelete}
      deleteCluster={deleteCluster}
      stableSort={stableSort}
      getComparator={getComparator}
      getClusters={getClusters}
    />
  );
};

const mapDispatchToProps = (dispatch: any): ClustersListDispatchProps => {
  return {
    displayError: (message) => {
      dispatch(notificationActions.error(message));
    },
    displaySuccess: (message) => {
      dispatch(notificationActions.success(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(ClustersListContainer);
