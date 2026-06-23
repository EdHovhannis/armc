import MaterialTable, { MTableAction } from '@material-table/core';
import { Tooltip } from '@material-ui/core';
import { CheckCircleOutline, ErrorOutlineSharp } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import PieChartIcon from '@material-ui/icons/PieChart';
import SpeedIcon from '@material-ui/icons/Speed';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import { DetailPanelData, IndexOverviewDataNew } from '@src/utils/IndexUtils';
import { tableIcons } from '@src/utils/Utils';
import * as React from 'react';

import { InstanceBurger } from './InstanceBurger';

const LOCALE = {
  body: {
    emptyDataSourceMessage: 'Экземпляров нет',
  },
  header: {
    actions: '',
  },
};

export class TableDetailPanel extends React.PureComponent<any> {
  render() {
    const { isLimitFeatureSettingEnabled, isAdmin } = this.props;
    return (
      <MaterialTable
        icons={tableIcons}
        style={{ marginLeft: '40px' }}
        data={this.props.data}
        columns={[
          { title: 'Зона', field: 'zoneId' },
          {
            title: '',
            field: 'icon',
            render: (row: any) => {
              if (row.woBackup === null || row.woBackup === undefined) {
                return <></>;
              } else if (!row.woBackup) {
                return <CheckCircleOutline color="primary" />;
              }
              return (
                <Tooltip title={'Риск потери данныx: не ко всем коллекцияместь бэкапы'} placement="top">
                  <ErrorOutlineSharp color="error" />
                </Tooltip>
              );
            },
            grouping: false,
          },
          { title: 'Статус', field: 'status' },
          {
            title: 'Макс. скорость записи',
            field: 'maxDataRateBytesPerSec',
            hidden: !isLimitFeatureSettingEnabled,
            render: (row: IndexOverviewDataNew) => (row.maxDataRateBytesPerSec ? `${row.maxDataRateBytesPerSec} B/s` : ''),
          },
          {
            title: 'Макс. размер индекса',
            field: 'maxSizeBytes',
            hidden: !isLimitFeatureSettingEnabled,
            render: (row: IndexOverviewDataNew) => (row.maxSizeBytes ? `${row.maxSizeBytes} B` : ''),
          },
          {
            title: 'Макс. время хранения данных',
            field: 'maxStorageTimeSec',
            hidden: !isLimitFeatureSettingEnabled,
            render: (row: IndexOverviewDataNew) => (row.maxStorageTimeSec ? `${row.maxStorageTimeSec} сек` : ''),
          },
          {
            title: 'Стратегия',
            field: 'recoveryStrategy',
            hidden: !isLimitFeatureSettingEnabled,
            render: (row: any) => {
              return <div>{row?.recoveryStrategy}</div>;
            },
          },
          { title: 'id', field: 'id', hidden: true },
          { title: 'overdraftPercent', field: 'overdraftPercent', hidden: true },
        ]}
        options={{
          search: false,
          paging: false,
          showTitle: false,
          header: true,
          toolbar: false,
          actionsColumnIndex: -1,
          padding: 'dense',
        }}
        actions={[
          (rowData: DetailPanelData) => ({
            icon: () => {
              return !rowData.matchingVersions &&
                (!(rowData.overdraftPercent === 0) ||
                  !(rowData.maxAvailableOverdraft > 0) ||
                  !(
                    rowData.maxAvailableOverdraft &&
                    this.props.fulltextOverdraftConfig &&
                    this.props.fulltextOverdraftConfig.maxOverdraftPercent === rowData.maxAvailableOverdraft
                  )) ? (
                <SyncProblemIcon style={{ color: '#ffa532' }} />
              ) : (
                <div style={{ marginLeft: 24 }} />
              );
            },
            tooltip:
              !rowData.matchingVersions &&
              (!(rowData.overdraftPercent === 0) ||
                !(rowData.maxAvailableOverdraft > 0) ||
                !(
                  rowData.maxAvailableOverdraft &&
                  this.props.fulltextOverdraftConfig &&
                  this.props.fulltextOverdraftConfig.maxOverdraftPercent === rowData.maxAvailableOverdraft
                ))
                ? `Версия конфигурации: ${rowData.configVersion}
                 Версия экземпляра: ${rowData.instanceVersion}`
                : '',
            disabled: !(
              !rowData.matchingVersions &&
              (!(rowData.overdraftPercent === 0) ||
                !(rowData.maxAvailableOverdraft > 0) ||
                !(
                  rowData.maxAvailableOverdraft &&
                  this.props.fulltextOverdraftConfig &&
                  this.props.fulltextOverdraftConfig.maxOverdraftPercent === rowData.maxAvailableOverdraft
                ))
            ),
            onClick: (event, rowData: DetailPanelData) => {
              event.preventDefault();
              event.stopPropagation();
              this.props.refreshInstanceDialog({
                instanceVersion: rowData.instanceVersion,
                configVersion: rowData.configVersion,
                name: rowData.name,
                project: rowData.project,
                zoneId: rowData.zoneId,
              });
            },
            position: 'row',
          }),
          (rowData: DetailPanelData) => ({
            icon: () => {
              if (rowData.overdraftPercent) {
                return <SpeedIcon style={{ color: '#4CAF50' }} />;
              } else if (rowData.maxAvailableOverdraft == 0) {
                return <SpeedIcon style={{ color: '#FF0000' }} />;
              } else if (
                rowData.maxAvailableOverdraft &&
                this.props.fulltextOverdraftConfig &&
                this.props.fulltextOverdraftConfig.maxOverdraftPercent > rowData.maxAvailableOverdraft &&
                rowData.maxAvailableOverdraft > 0
              ) {
                return <SpeedIcon style={{ color: '#FFA500' }} />;
              } else if (!rowData.matchingVersions) {
                return <SyncProblemIcon style={{ color: '#ffa532' }} />;
              } else {
                return <div style={{ marginLeft: 24 }} />;
              }
            },
            tooltip:
              rowData.overdraftPercent > 0
                ? `Скорость обработки увеличена на ${rowData.overdraftPercent}%`
                : rowData.maxAvailableOverdraft == 0
                  ? 'Овердрафт скорости невозможен. Измените конфигурацию экземпляра.'
                  : rowData.maxAvailableOverdraft &&
                      this.props.fulltextOverdraftConfig &&
                      this.props.fulltextOverdraftConfig.maxOverdraftPercent > rowData.maxAvailableOverdraft &&
                      rowData.maxAvailableOverdraft > 0
                    ? `Овердрафт скорости ограничен. Максимальный процент увеличения в настройках: ${this.props.fulltextOverdraftConfig.maxOverdraftPercent}%`
                    : !rowData.matchingVersions
                      ? `Версия конфигурации: ${rowData.configVersion}
                 Версия экземпляра: ${rowData.instanceVersion}`
                      : '',
            disabled:
              rowData.overdraftPercent > 0
                ? false
                : rowData.maxAvailableOverdraft === 0
                  ? true
                  : rowData.maxAvailableOverdraft &&
                      this.props.fulltextOverdraftConfig &&
                      this.props.fulltextOverdraftConfig.maxOverdraftPercent > rowData.maxAvailableOverdraft
                    ? false
                    : rowData.matchingVersions,
            onClick: (event, rowData: DetailPanelData) => {
              event.preventDefault();
              event.stopPropagation();
              if (rowData.maxAvailableOverdraft == 0) {
                this.props.displayError('Овердрафт скорости невозможен. Измените конфигурацию экземпляра.');
              } else if (
                rowData.maxAvailableOverdraft &&
                this.props.fulltextOverdraftConfig &&
                this.props.fulltextOverdraftConfig.maxOverdraftPercent > rowData.maxAvailableOverdraft &&
                rowData.maxAvailableOverdraft > 0
              ) {
                this.props.onCloseMenu(
                  this.props.menuType.overdraft,
                  rowData.name,
                  rowData.project,
                  null,
                  null,
                  rowData.zoneId,
                  rowData.overdraftPercent,
                  rowData.maxAvailableOverdraft,
                );
              } else if (rowData.overdraftPercent > 0) {
                this.props.onCloseMenu(
                  this.props.menuType.overdraft,
                  rowData.name,
                  rowData.project,
                  null,
                  null,
                  rowData.zoneId,
                  rowData.overdraftPercent,
                  rowData.maxAvailableOverdraft,
                );
              } else if (!rowData.matchingVersions) {
                this.props.refreshInstanceDialog({
                  instanceVersion: rowData.instanceVersion,
                  configVersion: rowData.configVersion,
                  name: rowData.name,
                  project: rowData.project,
                  zoneId: rowData.zoneId,
                });
              }
            },
            position: 'row',
          }),
          (rowData: IndexOverviewDataNew) => ({
            icon: () => <PieChartIcon color={'primary'} />,
            tooltip: 'Статистика',
            onClick: (event, rowDataDetail: DetailPanelData) => {
              event.preventDefault();
              event.stopPropagation();
              this.props.statisticsLoad(rowDataDetail);
            },
            position: 'row',
            hidden: !(rowData.flowActions.includes('VIEW') || isAdmin),
          }),
          {
            icon: () => <MenuIcon color={'primary'} />,
            tooltip: 'Действия над экземпляром',
            isFreeAction: false,
            position: 'row',
          },
        ]}
        localization={LOCALE}
        components={{
          Action: (props) => {
            if (props.action.tooltip === 'Действия над экземпляром') {
              return (
                <div>
                  <InstanceBurger
                    {...props}
                    user={this.props.user}
                    isAdmin={this.props.isAdmin}
                    onClose={this.props.onCloseMenu}
                    displayError={this.props.displayError}
                    fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
                    isLimitFeatureSettingEnabled={isLimitFeatureSettingEnabled}
                    countInstance={this.props.countInstance}
                  />
                </div>
              );
            } else {
              return <MTableAction {...props} />;
            }
          },
        }}
      />
    );
  }
}
