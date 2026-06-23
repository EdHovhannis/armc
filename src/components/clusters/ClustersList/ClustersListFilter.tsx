import * as React from 'react';

import FilterMenu, { FilterMenuItem } from '../../utils/FilterMenu';
import { Cluster } from '../types';

interface IClustersListFilter {
  originalClusters: Cluster[];
  filter: FilterMenuItem[] | undefined;
  onChange(filters: FilterMenuItem[]): any;
}

const ClustersListFilter: React.FC<IClustersListFilter> = ({ originalClusters, filter, onChange }: IClustersListFilter) => {
  const columns = [
    {
      name: 'Название',
      field: 'name',
      variants: originalClusters.map((cluster: Cluster) => {
        return cluster.name;
      }),
    },
  ];
  return <FilterMenu filter={filter} columns={columns} onChange={(filter) => onChange(filter)} />;
};

export default ClustersListFilter;
