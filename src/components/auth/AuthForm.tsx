import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab/Tab';
import Tabs from '@material-ui/core/Tabs/Tabs';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import LockIcon from '@material-ui/icons/LockOutlined';
import * as React from 'react';

import RegisterForm, { RegisterFormProps } from './RegisterForm';
import SignInForm, { SignInFormProps } from './SignInForm';

const styles = (theme) =>
  createStyles({
    main: {
      width: 'auto',
      display: 'block',
      marginLeft: theme.spacing.unit * 3,
      marginRight: theme.spacing.unit * 3,
      [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
        width: 400,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
    paper: {
      marginTop: theme.spacing.unit * 8,
    },
    avatar: {
      margin: theme.spacing.unit,
      backgroundColor: theme.palette.secondary.main,
    },
    viewForm: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    },
    form: {
      width: '100%',
      marginTop: theme.spacing.unit,
    },
    submit: {
      marginTop: theme.spacing.unit * 3,
    },
  });

export interface AuthFormProps {
  registerEnabled: boolean;
}

export type AuthFormDispatchProps = SignInFormProps & RegisterFormProps;
type AuthFormDispatchPropsWithStyles = AuthFormDispatchProps & WithStyles<typeof styles> & AuthFormProps;

interface AuthFormState {
  signViewActive: boolean;
}

class AuthForm extends React.Component<AuthFormDispatchPropsWithStyles, AuthFormState> {
  constructor(props) {
    super(props);
    this.state = {
      signViewActive: true,
    };
  }

  handleTabChange = (event, value) => {
    if (value == 0)
      this.setState({
        signViewActive: true,
      });
    else
      this.setState({
        signViewActive: false,
      });
  };

  getForm() {
    if (this.state.signViewActive) return <SignInForm onSignInClicked={this.props.onSignInClicked} />;
    else return <RegisterForm onRegisterClicked={this.props.onRegisterClicked} onError={this.props.onError} />;
  }

  render() {
    const { classes } = this.props;
    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          {this.props.registerEnabled && (
            <Tabs value={this.state.signViewActive ? 0 : 1} style={{ width: '100%' }} onChange={this.handleTabChange}>
              <Tab label="Авторизация" style={{ width: '50%' }} />
              <Tab label="Регистрация" style={{ width: '50%' }} />
            </Tabs>
          )}
          <div className={classes.viewForm}>
            <Avatar className={classes.avatar}>
              <LockIcon />
            </Avatar>
            {this.getForm()}
          </div>
        </Paper>
      </main>
    );
  }
}

export default withStyles(styles)(AuthForm);
