import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { blue } from '@material-ui/core/colors';
import amber from '@material-ui/core/colors/amber';
import green from '@material-ui/core/colors/green';
import { Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
// eslint-disable-next-line import/no-extraneous-dependencies
import classNames from 'classnames';
import * as React from 'react';
import autoBind from 'react-autobind/src/autoBind';
import connect from 'react-redux/es/connect/connect';

import WaitingDialog from '../components/WaitingDialog';
import { ApplicationState } from '../store/Store';
import * as notificationActions from '../store/notification/Actions';
import * as notificationSelectors from '../store/notification/Reducer';

const styles = (theme: Theme) => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: blue[500],
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
});

interface Props {
  isOpen: boolean;
  message: {
    message: string;
    details: JSX.Element;
  };
  variant: string;
}

interface DispatchProps {
  close();
}

type MergedProps = Props & DispatchProps & WithStyles<typeof styles>;
interface MergedState {
  waitingDialogOpen: boolean;
}

class StatusSnackBar extends React.Component<MergedProps, MergedState> {
  constructor(props) {
    super(props);
    this.state = {
      waitingDialogOpen: false,
    };

    autoBind(this);
  }

  handleClose = () => {
    this.props.close();
  };

  handleOpenWindow = () => {
    this.setState({ waitingDialogOpen: true });
    this.handleClose();
  };
  handleCloseWindow = () => {
    this.setState({ waitingDialogOpen: false });
  };

  static variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
  };

  render() {
    const { classes, message } = this.props;
    const { waitingDialogOpen } = this.state;
    const Icon = StatusSnackBar.variantIcon[this.props.variant];
    const isMessageString = typeof message === 'string';
    return (
      <>
        {waitingDialogOpen ? (
          <WaitingDialog
            open={waitingDialogOpen}
            onClose={this.handleCloseWindow}
            complete={waitingDialogOpen}
            success={false}
            successMessage={''}
            errorMessage={message.message}
            title={''}
            needDetailedInfo={waitingDialogOpen}
            details={message.details}
          />
        ) : (
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            open={this.props.isOpen}
            autoHideDuration={6000}
            onClose={this.handleClose}
          >
            <SnackbarContent
              style={{ width: 'min-content', padding: '0 36px 8px 8px' }}
              className={classNames(classes[this.props.variant])}
              message={
                <>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                      }}
                      key="close"
                      aria-label="Close"
                      color="inherit"
                      onClick={this.handleClose}
                    >
                      <CloseIcon className={classes.icon} />
                    </IconButton>
                    <Icon className={classNames(classes.icon, classes.iconVariant)} />
                    <div>{isMessageString ? message : message.message}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {!isMessageString && message.details && (
                      <Button
                        style={{ fontSize: '10px', marginTop: '4px' }}
                        variant="outlined"
                        size="small"
                        color="inherit"
                        onClick={this.handleOpenWindow}
                      >
                        Детали
                      </Button>
                    )}
                  </div>
                </>
              }
            />
          </Snackbar>
        )}
      </>
    );
  }
}

function mapStateToProps(state: ApplicationState): Props {
  return {
    message: notificationSelectors.message(state),
    isOpen: notificationSelectors.isOpen(state),
    variant: notificationSelectors.variant(state),
  };
}

function mapDispatchToProps(dispatch: any): DispatchProps {
  return {
    close: () => {
      dispatch(notificationActions.close());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(StatusSnackBar));
