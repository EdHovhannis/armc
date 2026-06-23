import * as _ from 'lodash';
import * as React from 'react';
import { FC, useEffect, useState } from 'react';

import { useDebounce } from '../../../hooks/useDebounce';
import { ClusterInfoTableItem } from '../../../store/clusters/Types';

import { ClustersInfoView } from './ClustersInfoView';

export interface IClustersInfoContainer {
  clusters: ClusterInfoTableItem[];
  isAdmin: boolean;

  setClustersInfo(clusters: ClusterInfoTableItem[]): void;
}

export const ClustersInfoContainer: FC<IClustersInfoContainer> = ({ clusters, isAdmin, setClustersInfo }: IClustersInfoContainer) => {
  const [data, setData] = useState(clusters);
  const debouncedData = useDebounce(data, 200);

  useEffect(() => {
    setClustersInfo(data);
  }, [debouncedData]);

  const onPartitionsChanged = (clusterId: number, maxPartitions: number) => {
    const helperData = _.cloneDeep<ClusterInfoTableItem[]>(data);

    const clusterIndex = helperData.findIndex((d) => d.clusterId === clusterId);

    if (clusterIndex !== -1) {
      helperData[clusterIndex].maxPartitions = maxPartitions;
      setData(helperData);
    }
  };

  const onEnableChanged = (clusterId: number, isEnable: boolean) => {
    const helperData = _.cloneDeep<ClusterInfoTableItem[]>(data);

    const clusterIndex = helperData.findIndex((d) => d.clusterId === clusterId);

    if (clusterIndex !== -1) {
      helperData[clusterIndex].isEnable = isEnable;
      setData(helperData);
    }
  };

  const columns: ClusterInfoColumn[] = [
    { id: 'name', label: 'Имя кластера', minWidth: 250 },
    { id: 'currentPartitions', label: 'Текущее количество используемых партиций в проекте', minWidth: 150 },
    {
      id: 'maxPartitions',
      label: 'Квота на количество партиций для проекта / Максимальное значение квоты',
      minWidth: 150,
      // format: (value: number) => value.toLocaleString('en-US'),
    },
    {
      id: 'isEnable',
      label: 'Кластер доступен для проекта',
      align: 'center',
      minWidth: 75,
      // format: (value: number) => value.toFixed(2),
    },
  ];

  return (
    <ClustersInfoView
      clusters={data}
      isAdmin={isAdmin}
      columns={columns}
      isEmpty={!data.length}
      onPartitionsChanged={onPartitionsChanged}
      onEnableChanged={onEnableChanged}
    />
  );
};
