import { IconButton } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Delete, Settings } from '@material-ui/icons';
import { Project } from '@src/store/project/Types';
import * as React from 'react';
import { Link } from 'react-router';

import TracingCreateDialogContainer from '../../../containers/tracing/datasources/TracingCreateDialogContainer';
import { User } from '../../../store/auth/Types';
import { Resource, Role } from '../../../store/role/Types';
import { TracingSupervisorDescription } from '../../../store/tracingDatasources/Types';
import ConfirmDialog from '../../ConfirmDialog';
import JournalLoader from '../../loader/JournalLoader';
import { withNavigation, WithNavigationProps } from '../../utils/withNavigation';

import TracingDatasourceOverviewNavigation from './TracingDatasourceOverviewNavigation';

export interface TracingOverviewProps {
  datasources: Map<number, TracingSupervisorDescription> | undefined;
  isLoading: boolean;

  isAdmin: boolean;
  user?: User;
  projects: Project[];
}

export interface TracingOverviewDispatchProps {
  handleDeleteClick: (datasourceId: number, okCallback?, errorCallback?) => void;
  fetchDatasources: () => void;
}

interface TopicsFormState {
  isCreateDialogOpen: boolean;

  confirmDelete: boolean;
  deleteId: number;
  deleteName: string;
}

class TracingDatasourceOverview extends React.Component<TracingOverviewProps & TracingOverviewDispatchProps & WithNavigationProps, TopicsFormState> {
  constructor(props) {
    super(props);
    this.state = {
      isCreateDialogOpen: false,
      confirmDelete: false,
      deleteId: -1,
      deleteName: '',
    };
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmDelete: false });
    if (value === 'Ok') {
      this.props.handleDeleteClick(
        this.state.deleteId,
        () => {
          this.props.fetchDatasources();
          this.setState({ deleteId: -1, deleteName: '' });
        },
        () => {
          this.setState({ deleteId: -1, deleteName: '' });
        },
      );
    }
  }

  componentDidMount(): void {
    this.props.fetchDatasources();
  }

  render() {
    const { isLoading, isAdmin, projects } = this.props;
    return (
      <>
        <TracingDatasourceOverviewNavigation
          canCreate={isAdmin || projects.length > 0}
          openSearchClicked={() => {
            this.props.navigate('/tracing/search');
          }}
          createClicked={() => {
            this.setState({
              isCreateDialogOpen: true,
            });
          }}
          openGraphClicked={() => {}}
        />
        <TracingCreateDialogContainer
          isOpen={this.state.isCreateDialogOpen}
          onDialogClose={() => {
            this.setState({
              isCreateDialogOpen: false,
            });
          }}
          onCreateSuccess={() => {
            this.setState({
              isCreateDialogOpen: false,
            });
          }}
        />
        {isLoading && <JournalLoader />}
        {!isLoading && this.renderTable()}
      </>
    );
  }

  renderTable() {
    const { datasources } = this.props;
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Paper style={{ width: 800, marginTop: 16 }}>
          <Table style={{ textDecoration: 'none' }} size={'small'}>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell align="right">Id</TableCell>
                <TableCell align="right">Проект</TableCell>
                <TableCell align="right">Трейсы</TableCell>
                <TableCell align="right">Вызовы</TableCell>
                <TableCell align="right">Дерево</TableCell>
                <TableCell align="right">Настройки</TableCell>
                <TableCell align="right">Удалить</TableCell>
              </TableRow>
            </TableHead>
            <TableBody style={{ textDecoration: 'none' }}>
              {datasources &&
                Array.from(datasources.values()).map((datasource: TracingSupervisorDescription) => {
                  return (
                    <TableRow
                      key={datasource.id}
                      hover
                      component={Link}
                      style={{ textDecoration: 'none' }}
                      {...({ to: '/tracing/datasource/' + datasource.id } as any)}
                    >
                      <TableCell color={'primary'} component="th">
                        {datasource.name}
                      </TableCell>
                      <TableCell align="right">{datasource.id}</TableCell>
                      <TableCell align="right">{datasource.projectId} </TableCell>
                      <TableCell align="right">{datasource.traceSupervisorId}</TableCell>
                      <TableCell align="right">{datasource.callsSupervisorId}</TableCell>
                      <TableCell align="right">{datasource.treeSupervisorId}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.props.navigate('/tracing/datasource/' + datasource.id);
                          }}
                        >
                          <Settings color={'primary'} />
                        </IconButton>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.setState({
                              deleteId: datasource.id,
                              confirmDelete: true,
                              deleteName: datasource.name,
                            });
                            // if (window.confirm("Вы уверены что хотите удалить источник трейсов?")) {
                            //   this.props.handleDeleteClick(datasource.id)
                            // }
                          }}
                        >
                          <Delete color={'primary'} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Paper>

        <ConfirmDialog
          warningText={'Вы уверены, что хотите удалить источник трейсов ' + this.state.deleteName + '? ' + 'Его будет невозможно восстановить.'}
          open={this.state.confirmDelete}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogDeleteClose}
        />
      </div>
    );
  }
}

export default withNavigation(TracingDatasourceOverview);
