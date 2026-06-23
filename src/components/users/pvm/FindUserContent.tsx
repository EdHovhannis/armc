import { Grid, TextField, Tooltip } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';

import { User } from '../../../store/auth/Types';

interface FindUserContentProps {
  minCountMask: number;
  maxCountUser: number;
  users: User[];
  usersIsLoading: boolean;

  searchUser: (mask: string, okCallback?, errorCallback?) => void;
  displayError: (message: string) => void;
  choseUser: (user: User) => void;
}

interface FindUserContentState {
  mask?: string;
  currentUser?: User;
  nonSearch: boolean;
}

export class FindUserContent extends React.Component<FindUserContentProps, FindUserContentState> {
  constructor(props) {
    super(props);
    this.state = {
      mask: undefined,
      nonSearch: true,
    };
  }

  render() {
    return (
      <React.Fragment>
        <Grid container style={{ width: '100%' }} direction="column">
          <Grid container direction="row" style={{ width: '100%' }}>
            <Grid item style={{ width: 'calc(100% - 50px)' }}>
              <TextField
                fullWidth
                error={this.state.mask?.length < this.props.minCountMask}
                variant={'standard'}
                defaultValue={this.state.mask}
                value={this.state.mask}
                helperText={`Минимальная длина маски ${this.props.minCountMask} символов. Чем длиннее маска, тем точнее будет поиск.
                    Результаты поиска могут быть неполными. Максимальное отображаемое количество пользователей ${this.props.maxCountUser}.`}
                label="Маска"
                onChange={(e) => {
                  this.setState({ mask: e.target.value });
                }}
              />
            </Grid>
            <Grid item>
              <Tooltip title={'Найти пользователей'} color={'primary'}>
                <IconButton
                  disabled={this.state.mask?.length < this.props.minCountMask}
                  style={{ marginTop: 8, marginLeft: 10, width: 40 }}
                  onClick={(e) => {
                    this.props.searchUser(this.state.mask);
                    this.setState({ nonSearch: false });
                  }}
                >
                  <SearchIcon color="primary" style={{ height: 30, width: 30 }} />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          {!this.state.nonSearch && (
            <Grid item>
              {this.props.usersIsLoading ? (
                <Grid container style={{ width: '100%', paddingTop: 8 }} justifyContent="center" alignItems="center">
                  <Grid item>
                    <CircularProgress disableShrink />
                  </Grid>
                </Grid>
              ) : (
                <Autocomplete
                  id="choose-search-user"
                  fullWidth
                  noOptionsText={'Пользователи по Вашей маске не найдены'}
                  getOptionSelected={(option, value) => option.name === value.name}
                  getOptionDisabled={(option) => option.id === ''}
                  getOptionLabel={(option) => option.name}
                  renderOption={(option) => option.name}
                  options={this.props.users}
                  onChange={(event, value) => {
                    if (value != null && value && value?.id !== '') {
                      this.props.choseUser(value);
                      this.setState({ currentUser: value });
                    }
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth label={'Выбор пользователя'} />}
                />
              )}
            </Grid>
          )}
        </Grid>
      </React.Fragment>
    );
  }
}
