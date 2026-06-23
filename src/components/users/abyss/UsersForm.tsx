import MaterialTable from '@material-table/core';
import { withNavigation, WithNavigationProps } from '@src/components/utils/withNavigation';
import * as React from 'react';
import { RouterProps } from 'react-router';

import { User } from '../../../store/auth/Types';
import { tableIcons } from '../../../utils/Utils';
import { Loader } from '../../utils/Loader';

export interface UsersFormProps {
  users: Array<User>;
  isLoading: boolean;
}

class UsersForm extends React.Component<UsersFormProps & WithNavigationProps, any> {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    } else {
      return this.renderUserList();
    }
  }

  renderUserList() {
    return (
      <React.Fragment>
        <MaterialTable
          icons={tableIcons}
          title="Пользователи"
          options={{
            search: true,
            paging: false,
            showTitle: true,
            actionsColumnIndex: -1,
            header: true,
          }}
          columns={[
            { title: 'id', field: 'id', hidden: true },
            { title: 'Имя пользователя', field: 'name', align: 'center' },
            {
              title: 'Администратор',
              field: 'admin',
              type: 'boolean',
              align: 'center',
            },
          ]}
          data={this.props.users}
          localization={{
            toolbar: {
              searchTooltip: 'Поиск',
              searchPlaceholder: 'Найти пользователя',
            },
            body: {
              emptyDataSourceMessage: 'Список пользователей пуст',
              addTooltip: '',
              deleteTooltip: 'Удалить',
              editTooltip: 'Редактировать',
              editRow: {
                deleteText: 'Вы уверены, что хотите удалить пользователя?',
                cancelTooltip: 'Отмена',
                saveTooltip: 'Подтвердить',
              },
            },
            header: {
              actions: '',
            },
          }}
          onRowClick={(event, rowData: User) => this.props.navigate('/settings/users/' + rowData.id)}
        />
      </React.Fragment>
    );
  }
}

export default withNavigation(UsersForm);
