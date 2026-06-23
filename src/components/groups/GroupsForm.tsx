import MaterialTable from '@material-table/core';
import { Typography } from '@material-ui/core';
import * as React from 'react';

import { Group } from '../../store/group/Types';
import { tableIcons } from '../../utils/Utils';
import { AddFab } from '../utils/AddFab';
import { Loader } from '../utils/Loader';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

import CreateGroupDialog from './CreateGroupDialog';

export interface GroupsFormProps {
  groups: Array<Group>;
  isLoading: boolean;
  isAdmin: boolean;
  displayError: (msg: string) => void;
}

export interface GroupsFormDispatchProps {
  createGroup(group: string);
}

class GroupsForm extends React.Component<GroupsFormProps & GroupsFormDispatchProps & WithNavigationProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      opened: false,
    };
  }

  render(): React.ReactNode {
    if (this.props.isLoading) {
      return <Loader />;
    } else {
      return this.renderGroups();
    }
  }

  renderGroups() {
    return (
      <React.Fragment>
        <MaterialTable
          icons={tableIcons}
          title="Группы"
          options={{
            pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            emptyRowsWhenPaging: false,
            search: true,
            paging: true,
            showTitle: true,
            actionsColumnIndex: -1,
            header: true,
          }}
          columns={[
            { title: 'id', field: 'id', hidden: true },
            {
              title: 'Название группы',
              field: 'name',
              render: (data) => (data.virtual ? <Typography style={{ color: 'grey' }}>{data.name}</Typography> : <div> {data.name} </div>),
            },
            {
              title: 'Виртуальная',
              field: 'virtual',
              type: 'boolean',
              hidden: true,
            },
          ]}
          data={this.props.groups}
          localization={{
            toolbar: {
              searchTooltip: 'Поиск',
              searchPlaceholder: 'Найти группу',
            },
            body: {
              emptyDataSourceMessage: 'Список групп пуст',
              addTooltip: '',
              deleteTooltip: 'Удалить',
              editTooltip: 'Редактировать',
              editRow: {
                deleteText: 'Вы уверены, что хотите удалить группу?',
                cancelTooltip: 'Отмена',
                saveTooltip: 'Подтвердить',
              },
            },
            header: {
              actions: '',
            },
          }}
          onRowClick={(_, rowData) => {
            if (rowData && !rowData.virtual) {
              this.props.navigate('/settings/groups/' + rowData.id);
            }
          }}
        />

        <AddFab title={'Создать группу'} onClick={() => this.setState({ opened: true })} />

        <CreateGroupDialog
          open={this.state.opened}
          handleClose={() => this.setState({ opened: false })}
          handleGroupCreate={(group_name) => {
            this.props.createGroup(group_name);
            this.setState({ opened: false });
          }}
          displayError={(msg) => this.props.displayError(msg)}
        />
      </React.Fragment>
    );
  }
}

export default withNavigation(GroupsForm);
