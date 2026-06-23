import { Grid, TextField, Tooltip } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import { NotInterested, CheckCircleOutlineRounded, HighlightOffRounded, RecentActorsRounded } from '@material-ui/icons';
import SearchIcon from '@material-ui/icons/Search';
import * as React from 'react';

import { User } from '../../../store/auth/Types';

import FindPVMUserDialog from './FindPVMUserDialog';

interface CheckPVMUserFormProps {
  minCountMask: number;
  displayError: (error: string) => void;
  choseUser: (user: User) => void;
  fetchUser: (user_id: number, okCallback?, errorCallback?) => void;
  user?: User;
  isLoading: boolean;
}

interface CheckPVMUserFormStat {
  isSearchOpen: boolean;
  user?: User;
  userName?: string;
  nonUser: boolean;
  isFindUser: boolean;
}

export class CheckPVMUserForm extends React.Component<CheckPVMUserFormProps, CheckPVMUserFormStat> {
  constructor(props) {
    super(props);
    this.state = {
      isSearchOpen: false,
      isFindUser: false,
      nonUser: true,
    };
  }

  render() {
    return (
      <React.Fragment>
        <Grid container justifyContent="flex-start" alignItems="center" style={{ width: '100%' }} direction={'row'}>
          <Grid item style={{ width: 'calc(100% - 152px)' }}>
            <TextField
              fullWidth
              variant={'standard'}
              defaultValue={this.state.userName}
              value={this.state.userName}
              label="Имя пользователя"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => {
                this.props.choseUser(null);
                this.setState({ userName: e.target.value, user: undefined, nonUser: true, isFindUser: false });
              }}
            />
          </Grid>

          {!this.state.nonUser && this.state.isFindUser && !this.props.isLoading && (
            <Tooltip title={'Пользователь найден'} color={'primary'}>
              <Grid item style={{ marginTop: 8, marginLeft: 8, width: 32 }}>
                <CheckCircleOutlineRounded color="primary" style={{ height: 30, width: 30, marginTop: 6 }} />
              </Grid>
            </Tooltip>
          )}
          {!this.state.nonUser && !this.state.isFindUser && !this.props.isLoading && (
            <Tooltip title={'Пользователь не найден'} color={'primary'}>
              <Grid item style={{ marginTop: 8, marginLeft: 8, width: 32 }}>
                <HighlightOffRounded color="error" style={{ height: 30, width: 30, marginTop: 6 }} />
              </Grid>
            </Tooltip>
          )}
          {this.props.isLoading && (
            <Grid item style={{ marginTop: 8, marginLeft: 8, width: 32 }}>
              <CircularProgress disableShrink size={28} />
            </Grid>
          )}
          {this.state.nonUser && !this.props.isLoading && (
            <Tooltip title={'Пользователь не выбран'} color={'primary'}>
              <Grid item style={{ marginTop: 8, marginLeft: 8, width: 32 }}>
                <NotInterested color="disabled" style={{ height: 28, width: 28, marginTop: 6 }} />
              </Grid>
            </Tooltip>
          )}

          <Grid item>
            <Tooltip title={'Проверить пользователя'} color={'primary'}>
              <IconButton
                style={{ marginTop: 8, marginLeft: 8, width: 40 }}
                onClick={(e) => {
                  if (this.state.userName == null || this.state.userName === '') {
                    this.props.displayError('Имя пользователя не может быть пустым');
                    return;
                  }
                  //todo user_id === userName
                  this.props.fetchUser(
                    this.state.userName,
                    (user) => {
                      this.setState({ user: user, isFindUser: true, nonUser: false });
                      this.props.choseUser(user);
                    },
                    (error) => {
                      this.setState({ isFindUser: false, nonUser: false });
                    },
                  );
                }}
              >
                <RecentActorsRounded color="primary" style={{ height: 30, width: 30 }} />
              </IconButton>
            </Tooltip>
          </Grid>

          <Grid item>
            <Tooltip title={'Найти пользователя'} color={'primary'}>
              <IconButton
                style={{ marginTop: 8, marginLeft: 10, marginRight: 4, width: 40 }}
                onClick={(e) => {
                  this.setState({ isSearchOpen: true });
                }}
              >
                <SearchIcon color="primary" style={{ height: 30, width: 30 }} />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        {this.state.isSearchOpen && (
          <FindPVMUserDialog
            close={() => {
              this.setState({ isSearchOpen: false });
            }}
            onChange={(user) => {
              this.setState({ user: user, userName: user.name, nonUser: false, isFindUser: true });
              this.props.choseUser(user);
            }}
            displayError={this.props.displayError}
            fetchUser={this.props.fetchUser}
            minCountMask={this.props.minCountMask}
          />
        )}
      </React.Fragment>
    );
  }
}
