import MaterialTable from '@material-table/core';
import { Button, Grid, Paper } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ApplicationState } from '../../../store/Store';
import { fetchHealthCheckConfig, updateHealthCheckConfig } from '../../../store/config/Actions';
import { IHealthCheckSelection, IHealthChecks } from '../../../store/config/Types';
import ConfirmDialog from '../../ConfirmDialog';

import {
  formatAuthorLabel,
  formatServiceLabel,
  formatSourceLabel,
  formatTimeInStatus,
  formatUpdatedAt,
  formatZoneLabel,
  getHealthCheckRowId,
  getTextForConfirm,
  selectionToServiceByZone,
} from './helpers';

type HealthCheckTableRow = IHealthChecks & {
  isActionRow?: boolean;
  tableData: { id: string };
};

const statusStyle = (status: 'ON' | 'OFF') => ({
  color: status === 'OFF' ? '#d32f2f' : '#2e7d32',
});

export const HealthCheckSettings = () => {
  const dispatch = useDispatch();
  const { healthCheckConfigData, isHealthCheckConfigsLoading } = useSelector((state: ApplicationState) => state.config);

  const [selectedRows, setSelectedRows] = useState<IHealthCheckSelection[]>([]);
  const [changeSetting, setChangeSettingDialogOpen] = useState({
    isDialogOpen: false,
    health: '',
  });

  useEffect(() => {
    dispatch(fetchHealthCheckConfig());
  }, [dispatch]);

  useEffect(() => {
    setSelectedRows([]);
  }, [healthCheckConfigData]);

  const sortedConfigData = useMemo(
    () =>
      [...healthCheckConfigData].sort(
        (a, b) => a.service.localeCompare(b.service) || a.zone.localeCompare(b.zone),
      ),
    [healthCheckConfigData],
  );

  const isRowSelected = useCallback(
    (row: IHealthChecks) => selectedRows.some((item) => getHealthCheckRowId(item) === getHealthCheckRowId(row)),
    [selectedRows],
  );

  const handleSelectRow = useCallback((row: IHealthChecks) => {
    const rowId = getHealthCheckRowId(row);
    setSelectedRows((prev) => {
      if (prev.some((item) => getHealthCheckRowId(item) === rowId)) {
        return prev.filter((item) => getHealthCheckRowId(item) !== rowId);
      }
      return [...prev, { service: row.service, zone: row.zone }];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedRows((prev) => (prev.length === sortedConfigData.length ? [] : sortedConfigData.map(({ service, zone }) => ({ service, zone }))));
  }, [sortedConfigData]);

  const handleChangeSetting = (value: string) => {
    if (value === 'Ok') {
      dispatch(updateHealthCheckConfig(selectionToServiceByZone(selectedRows), changeSetting.health));
    }
    setChangeSettingDialogOpen({ isDialogOpen: false, health: '' });
  };

  const tableData: HealthCheckTableRow[] = useMemo(
    () => [
      { isActionRow: true, tableData: { id: 'ACTION_ROW' } } as HealthCheckTableRow,
      ...sortedConfigData.map((item) => ({
        ...item,
        tableData: { id: getHealthCheckRowId(item) },
      })),
    ],
    [sortedConfigData],
  );

  const tableColumns = useMemo(
    () => [
      {
        title: '',
        field: 'checkbox',
        sorting: false,
        cellStyle: { width: 48, paddingLeft: 16 },
        headerStyle: { width: 48, paddingLeft: 16 },
        render: (rowData: HealthCheckTableRow) => {
          if (rowData.isActionRow) {
            const isAllSelected = sortedConfigData.length > 0 && selectedRows.length === sortedConfigData.length;
            return (
              <div onClick={handleSelectAll} style={{ cursor: 'pointer' }}>
                <Checkbox checked={isAllSelected} onChange={() => {}} color="primary" />
              </div>
            );
          }
          return (
            <div onClick={() => handleSelectRow(rowData)} style={{ cursor: 'pointer' }}>
              <Checkbox checked={isRowSelected(rowData)} onChange={() => {}} color="primary" />
            </div>
          );
        },
      },
      {
        title: 'Сервис',
        field: 'service',
        sorting: false,
        render: (rowData: HealthCheckTableRow) =>
          rowData.isActionRow ? (
            <span onClick={handleSelectAll} style={{ color: '#1976d2', cursor: 'pointer' }}>
              Выбрать все
            </span>
          ) : (
            formatServiceLabel(rowData.service)
          ),
      },
      {
        title: 'Зона',
        field: 'zone',
        sorting: false,
        render: (rowData: HealthCheckTableRow) => (rowData.isActionRow ? null : formatZoneLabel(rowData.zone)),
      },
      {
        title: 'Статус',
        field: 'manualHealth',
        sorting: false,
        render: (rowData: HealthCheckTableRow) =>
          rowData.isActionRow ? null : <span style={statusStyle(rowData.manualHealth)}>{rowData.manualHealth}</span>,
      },
      {
        title: 'Источник изменений',
        field: 'source',
        sorting: false,
        render: (rowData: HealthCheckTableRow) => (rowData.isActionRow ? null : formatSourceLabel(rowData.source)),
      },
      {
        title: 'Автор изменений',
        field: 'author',
        sorting: false,
        render: (rowData: HealthCheckTableRow) => (rowData.isActionRow ? null : formatAuthorLabel(rowData.author)),
      },
      {
        title: 'Время изменения',
        field: 'updatedAt',
        sorting: false,
        render: (rowData: HealthCheckTableRow) => (rowData.isActionRow ? null : formatUpdatedAt(rowData.updatedAt)),
      },
      {
        title: 'Время в статусе',
        field: 'timeInStatus',
        sorting: false,
        render: (rowData: HealthCheckTableRow) => (rowData.isActionRow ? null : formatTimeInStatus(rowData.updatedAt)),
      },
    ],
    [sortedConfigData.length, selectedRows.length, handleSelectAll, handleSelectRow, isRowSelected],
  );

  const isDisable = selectedRows.length === 0;

  return (
    <>
      <Grid style={{ padding: 40 }}>
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1200 }}>
          <h3 style={{ flex: 1 }}>Управление состоянием здоровья сервисов</h3>
          <Grid container direction="row" style={{ flex: 1, justifyContent: 'flex-end', gap: 16 }}>
            <Button
              onClick={() => setChangeSettingDialogOpen({ isDialogOpen: true, health: 'ON' })}
              disabled={isDisable}
              variant="outlined"
              style={{ color: isDisable ? 'grey' : 'green', borderColor: isDisable ? 'grey' : 'green' }}
            >
              Включить
            </Button>
            <Button
              onClick={() => setChangeSettingDialogOpen({ isDialogOpen: true, health: 'OFF' })}
              disabled={isDisable}
              variant="outlined"
              style={{ color: isDisable ? 'grey' : 'red', borderColor: isDisable ? 'grey' : 'red' }}
            >
              Выключить
            </Button>
          </Grid>
        </div>
        <MaterialTable
          style={{ width: '100%', maxWidth: 1200 }}
          components={{
            Container: (props) => <Paper {...props} elevation={0} />,
          }}
          columns={tableColumns}
          data={tableData}
          options={{
            paging: false,
            search: false,
            toolbar: false,
            headerStyle: {
              fontWeight: 600,
              color: '#1a2b4b',
              backgroundColor: '#f5f6f8',
            },
            rowStyle: (rowData: HealthCheckTableRow) => ({
              backgroundColor: rowData.isActionRow ? '#fafafa' : undefined,
            }),
          }}
          isLoading={isHealthCheckConfigsLoading}
        />
      </Grid>
      <ConfirmDialog
        warningText={getTextForConfirm(selectedRows, changeSetting.health)}
        open={changeSetting.isDialogOpen}
        okString={'Да'}
        cancelString={'Отмена'}
        onClose={handleChangeSetting}
      />
    </>
  );
};
