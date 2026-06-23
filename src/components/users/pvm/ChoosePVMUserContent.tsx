import { Grid, TextField, Tooltip, Typography } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import { CheckCircleOutlineRounded, HighlightOffRounded, NotInterested, RecentActorsRounded } from '@material-ui/icons';
import InfoIcon from '@material-ui/icons/Info';
import SearchIcon from '@material-ui/icons/Search';
import * as React from 'react';

import { HtmlTooltip } from '../../../containers/App';
import FindUserContentContainer from '../../../containers/users/pvm/FindUserContentContainer';
import { User } from '../../../store/auth/Types';

interface ChoosePVMUserContentProps {
  minCountMask: number;
  displayError: (error: string) => void;
  choseUser: (user: User) => void;
  fetchUser: (user_id: number, okCallback?, errorCallback?) => void;
  user?: User;
  isLoading: boolean;
}

interface ChoosePVMUserContentStat {
  isCertainUser: boolean;
  user?: User;
  userName?: string;
  nonUser: boolean;
  isFindUser: boolean;
}

export class ChoosePVMUserContent extends React.Component<ChoosePVMUserContentProps, ChoosePVMUserContentStat> {
  constructor(props) {
    super(props);
    this.state = {
      isCertainUser: true,
      isFindUser: false,
      nonUser: true,
    };
  }

  render() {
    return (
      <React.Fragment>
        <Grid container justifyContent="flex-start" alignItems="center" style={{ width: '100%' }} direction={'row'}>
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.isCertainUser}
                onChange={(event) => {
                  this.setState({
                    isCertainUser: event.target.checked,
                    user: undefined,
                    userName: undefined,
                    nonUser: true,
                    isFindUser: false,
                  });
                  this.props.choseUser(undefined);
                }}
                color={'primary'}
              />
            }
            label={'Поиск по точному совпадению имени'}
          />
          <HtmlTooltip
            placement="right-end"
            title={
              <React.Fragment>
                <Typography color="primary" variant={'caption'}>
                  Поиск по точному совпадению имени будет производиться во много раз быстрее.{' '}
                </Typography>
                <Typography color="primary" variant={'caption'}>
                  Если Вы точно знаете имя - лучше выбирайте данный способ.
                </Typography>
              </React.Fragment>
            }
          >
            <InfoIcon fontSize={'small'} color={'primary'} />
          </HtmlTooltip>
        </Grid>
        {!this.state.isCertainUser && (
          <React.Fragment>
            <FindUserContentContainer
              choseUser={(user) => {
                this.setState({ user: user });
                this.props.choseUser(user);
              }}
            />
          </React.Fragment>
        )}
        {this.state.isCertainUser && (
          <React.Fragment>
            <Grid container justifyContent="flex-start" alignItems="center" style={{ width: '100%' }} direction={'row'}>
              <Grid item style={{ width: 'calc(100% - 116px)' }}>
                <TextField
                  fullWidth
                  variant={'standard'}
                  value={this.state.userName}
                  label="Имя пользователя"
                  onChange={(e) => {
                    this.setState({ userName: e.target.value, user: undefined, nonUser: true, isFindUser: false });
                  }}
                />
              </Grid>
              <Grid item>
                <Tooltip title={'Проверить пользователя'} color={'primary'}>
                  <IconButton
                    style={{ marginTop: 8, marginLeft: 8, marginRight: 8, width: 60 }}
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

              {!this.state.nonUser && this.state.isFindUser && !this.props.isLoading && (
                <Tooltip title={'Пользователь найден'} color={'primary'}>
                  <Grid item style={{ marginTop: 8, marginLeft: 8, width: 32 }}>
                    <CheckCircleOutlineRounded color="primary" style={{ height: 30, width: 30 }} />
                  </Grid>
                </Tooltip>
              )}
              {!this.state.nonUser && !this.state.isFindUser && !this.props.isLoading && (
                <Tooltip title={'Пользователь не найден'} color={'primary'}>
                  <Grid item style={{ marginTop: 8, marginLeft: 8, width: 32 }}>
                    <HighlightOffRounded color="error" style={{ height: 30, width: 30 }} />
                  </Grid>
                </Tooltip>
              )}
              {this.props.isLoading && (
                <Grid item style={{ marginTop: 8, marginLeft: 8, width: 32 }}>
                  <CircularProgress disableShrink size={30} />
                </Grid>
              )}
              {this.state.nonUser && !this.props.isLoading && (
                <Tooltip title={'Пользователь не выбран'} color={'primary'}>
                  <Grid item style={{ marginTop: 8, marginLeft: 8, width: 32 }}>
                    <NotInterested color="disabled" style={{ height: 30, width: 30 }} />
                  </Grid>
                </Tooltip>
              )}
            </Grid>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
