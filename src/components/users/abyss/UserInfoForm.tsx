import { Avatar, Card, CardContent, Grid } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import TableCell from '@material-ui/core/TableCell';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { Route, RouteProps } from 'react-router';

import { User } from '../../../store/auth/Types';
import { Loader } from '../../utils/Loader';

const sberLogo = require('../../../images/sberbank_logo.png');

export interface UserInfoFormProps extends RouteProps {
  user: User | undefined;
  isLoading: boolean;
  canSetAdmin: boolean;
}

export interface UserInfoFormDProps {
  handleAdminToggle: (isAdmin: boolean) => void;
}

export default class UserInfoForm extends React.Component<UserInfoFormProps & UserInfoFormDProps, any> {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.user === undefined) return null;

    if (this.props.isLoading) {
      return <Loader />;
    } else {
      return this.renderUserInfoForm();
    }
  }

  renderUserInfoForm() {
    if (!this.props.user) return null;
    return (
      <div>
        <Grid container style={{ width: '100%', marginTop: '1vw' }} spacing={3} justifyContent="center" alignItems="center">
          <Grid item>
            <Paper style={{ width: 300, padding: 16 }}>
              <Typography variant={'h5'}>{this.props.user.name}</Typography>
              <Divider />
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography style={{ marginTop: 6 }}>Администратор</Typography>
                <Switch
                  disabled={!this.props.canSetAdmin}
                  defaultChecked={this.props.user?.admin}
                  onChange={(event) => {
                    this.props.handleAdminToggle(event.target.checked);
                  }}
                />
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}
