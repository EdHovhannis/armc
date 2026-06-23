import { Checkbox, InputAdornment, TableBody, TableCell, TableContainer, TextField, Tooltip, Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { getEnableFeatureSettingLimits } from '@src/store/featureSettings/Reducer';
import * as React from 'react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { ClusterInfoTableItem } from '../types';

export interface IClustersInfoView {
  clusters: ClusterInfoTableItem[];
  isAdmin: boolean;
  columns: ClusterInfoColumn[];
  isEmpty: boolean;

  onPartitionsChanged(clusterId: number, maxPartitions: number): void;

  onEnableChanged(clusterId: number, maxPartitions: boolean): void;
}

export const ClustersInfoView: FC<IClustersInfoView> = ({
  clusters = [],
  isAdmin,
  isEmpty,
  columns,
  onPartitionsChanged,
  onEnableChanged,
}: IClustersInfoView) => {
  const isLimitEnabled = useSelector(getEnableFeatureSettingLimits);

  return (
    <>
      <TableContainer style={{ maxHeight: 500 }}>
        <Table aria-label="sticky table" style={{ backgroundColor: '#fff' }}>
          <TableHead>
            <TableRow>
              {columns.map(({ id, label, align, minWidth }) => (
                <TableCell key={id} align={align} style={{ minWidth }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!isEmpty &&
              clusters.map(({ clusterId, currentPartitions, maxPartitions, name, remainingQuota, isEnable }) => {
                return (
                  <TableRow key={clusterId}>
                    <TableCell style={{ maxWidth: '200px' }}>
                      <Tooltip title={name}>
                        <Typography noWrap>{name}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth value={currentPartitions} disabled />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type={'number'}
                        fullWidth
                        value={maxPartitions}
                        disabled={!isAdmin || isLimitEnabled}
                        onChange={(e) => onPartitionsChanged(clusterId, +e.target.value)}
                        InputProps={{
                          inputProps: { min: 0 },
                          endAdornment: <InputAdornment position="end">/ {remainingQuota}</InputAdornment>,
                        }}
                      />
                    </TableCell>
                    <TableCell align={'center'}>
                      <Checkbox disabled={!isAdmin} checked={isEnable} onChange={(e) => onEnableChanged(clusterId, e.target.checked)} />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      {isEmpty && <div style={{ width: '100%', padding: '2rem', textAlign: 'center' }}>Отсутствуют кластера для настройки</div>}
    </>
  );
};
