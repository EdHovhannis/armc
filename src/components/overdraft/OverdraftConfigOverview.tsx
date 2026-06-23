import MaterialTable from '@material-table/core';
import { ThemeProvider, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { Edit, Refresh } from '@material-ui/icons';
import * as React from 'react';

import { OverdraftConfig } from '../../store/overdraft/Types';
import { IndexType, OverdraftTableInfo, OverdraftUtils } from '../../utils/OverdraftUtils';
import { tableIcons, theme } from '../../utils/Utils';
import WaitingDialog from '../WaitingDialog';

import EditOverdraftConfig from './EditOverdraftConfig';

export interface OverdraftConfigOverviewProps {
  fulltextOverdraftConfig?: OverdraftConfig;
  archiveOverdraftConfig?: OverdraftConfig;
  refresh: () => void;
  displayError: (msg: string) => void;
  setArchiveOverdraftConfig: (
    overdraft: OverdraftConfig,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  setFulltextOverdraftConfig: (
    overdraft: OverdraftConfig,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
}

export interface OverdraftConfigOverviewStat {
  selectedRow?: OverdraftTableInfo;
  openEditDialog: boolean;
  errorMessage: string;
  detailsMessage?: string;
  waitForEdit: boolean;
  successEdit: boolean;
  completeEdit: boolean;
}

export class OverdraftConfigOverview extends React.Component<OverdraftConfigOverviewProps, OverdraftConfigOverviewStat> {
  constructor(props) {
    super(props);
    this.state = {
      openEditDialog: false,
      errorMessage: '',
      successEdit: false,
      waitForEdit: false,
      completeEdit: false,
    };
  }

  render() {
    return (
      <React.Fragment>
        <Paper style={{ width: '100%' }}>
          <ThemeProvider theme={theme}>
            {/*@ts-ignore*/}
            <MaterialTable
              icons={tableIcons}
              columns={[
                {
                  title: 'Тип экземпляра',
                  field: 'type',
                  cellStyle: {
                    paddingTop: '10px',
                  },
                },
                {
                  title: 'Макс. количество экземпляров',
                  field: 'maxOverdraftedTasks',
                },
                {
                  title: 'Макс. процент увеличения скорости',
                  field: 'maxOverdraftPercent',
                },
                {
                  field: 'indexType',
                  hidden: true,
                },
              ]}
              localization={{
                body: {
                  emptyDataSourceMessage: 'Список настроек пуст',
                },
                header: {
                  actions: '',
                },
              }}
              data={OverdraftUtils.createDataForOverdraftConfigOverviewTable(this.props.archiveOverdraftConfig, this.props.fulltextOverdraftConfig)}
              title={
                <React.Fragment>
                  <Typography
                    variant="h6"
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Настройки увеличения скорости обработки экземпляров задач
                  </Typography>
                  <Typography variant={'subtitle2'}>
                    Изменение скорости обработки данных в экземпляре задачи происходит независимо от установленной на этом экземпляре квоты
                  </Typography>
                </React.Fragment>
              }
              options={{
                pageSize: 10,
                pageSizeOptions: [10, 25, 50],
                emptyRowsWhenPaging: false,
                padding: 'dense',
                search: false,
                paging: true,
                showTitle: true,
                header: true,
                actionsColumnIndex: -1,
                grouping: false,
              }}
              actions={[
                {
                  icon: () => <Edit color={'primary'} />,
                  tooltip: 'Редактировать настройкий',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({ selectedRow: rowData, openEditDialog: true });
                  },
                  position: 'row',
                },
                {
                  icon: () => <Refresh color={'primary'} />,
                  tooltip: 'Обновить настройки',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.props.refresh();
                  },
                  position: 'toolbar',
                },
              ]}
            />
          </ThemeProvider>
        </Paper>

        {this.state.openEditDialog && this.state.selectedRow && (
          <EditOverdraftConfig
            close={() => this.setState({ openEditDialog: false })}
            defaultOverdraft={this.state.selectedRow}
            editConfig={(config) => {
              this.setState({
                waitForEdit: true,
                completeEdit: false,
                successEdit: false,
              });
              switch (this.state.selectedRow?.indexType) {
                case IndexType.archive:
                  this.props.setArchiveOverdraftConfig(
                    config,
                    () => {
                      this.setState({
                        completeEdit: true,
                        successEdit: true,
                      });
                    },
                    (error) => {
                      this.setState({
                        completeEdit: true,
                        successEdit: false,
                        errorMessage: 'При обновлении настроек архивного индекса произошла ошибка: ' + error.message,
                        detailsMessage: error.details,
                      });
                    },
                  );
                  break;
                case IndexType.fulltext:
                  this.props.setFulltextOverdraftConfig(
                    config,
                    () => {
                      this.setState({
                        completeEdit: true,
                        successEdit: true,
                      });
                    },
                    (error) => {
                      this.setState({
                        completeEdit: true,
                        successEdit: false,
                        errorMessage: 'При обновлении настроек полнотекстового индекса произошла ошибка: ' + error.message,
                        detailsMessage: error.details,
                      });
                    },
                  );
                  break;
              }
            }}
            indexType={this.state.selectedRow.type}
            displayError={this.props.displayError}
          />
        )}

        <WaitingDialog
          customFormat={true}
          title={
            'Обновление настроек скорости для ' +
            (this.state.selectedRow?.indexType === IndexType.fulltext ? 'полнотекстового' : 'архивного') +
            ' индекса'
          }
          open={this.state.waitForEdit}
          onClose={() => {
            this.setState({ waitForEdit: false, errorMessage: '' });
          }}
          complete={this.state.completeEdit}
          success={this.state.successEdit}
          successMessage={'Настройки успешно обновлены'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailsMessage}
        />
      </React.Fragment>
    );
  }
}
