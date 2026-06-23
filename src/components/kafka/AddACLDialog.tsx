import { Grid, IconButton } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import { createStyles, withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { ClientACLRecord, OperationType } from '../../store/kafka/Types';
import ConfirmDialog from '../ConfirmDialog';

const styles = (theme) =>
  createStyles({
    resizable: {
      position: 'relative',
      '& .react-resizable-handle': {
        position: 'absolute',
        width: 20,
        height: 20,
        bottom: 0,
        right: 0,
        background:
          "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+')",
        'background-position': 'bottom right',
        padding: '0 3px 3px 0',
        'background-repeat': 'no-repeat',
        'background-origin': 'content-box',
        'box-sizing': 'border-box',
        cursor: 'se-resize',
      },
    },
  });

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface AddACLDialogProps {
  allOperationTypes?: Array<OperationType>;
  topicName: string;
  projectShortName: string;

  refreshACL(): any;

  displayError(msg: string): any;

  addACL(topicName, projectShortName, aclRecords: ClientACLRecord[], okCallback?): any;
  updateACL(topicName, projectShortName, aclRecords: ClientACLRecord[], okCallback?, matchType?: string): any;
  aclRecords: ClientACLRecord[];
}

export interface AddACLDialogState {
  allOperationTypes: Array<OperationType>;
  isAll: boolean;
  userSslCertificate: string;
  operationTypes: Array<OperationType>;
  open: boolean;
  confirmAclAddText: string;
  incomingAcl?: ClientACLRecord;
  matchType: 'some' | 'every' | 'noMatch';
}

class AddACLDialog extends React.Component<AddACLDialogProps, AddACLDialogState> {
  constructor(props) {
    super(props);
    let operations: Array<OperationType>;
    if (this.props.allOperationTypes === undefined) {
      operations = new Array<OperationType>();
      for (const type in OperationType) operations.push(type as OperationType);
    } else {
      operations = this.props.allOperationTypes;
    }
    this.state = {
      open: false,
      isAll: false,
      userSslCertificate: '',
      allOperationTypes: operations,
      operationTypes: [],
      confirmAclAddText: '',
      incomingAcl: undefined,
      matchType: 'noMatch',
    };
  }

  handleClickOpen = () => {
    this.setState({ open: true, operationTypes: [], userSslCertificate: '' });
  };

  handleClose = () => {
    this.setState({ open: false, isAll: false });
  };

  handleConfirmAclAdd = (action: string) => {
    const { aclRecords } = this.props;
    const { incomingAcl, matchType } = this.state;
    switch (action) {
      case 'Cancel':
        return this.setState({ confirmAclAddText: '', incomingAcl: undefined });
      case 'Ok': {
        const updatedAcl = aclRecords.map((item) => {
          if (item.userSslCertificate === incomingAcl?.userSslCertificate) {
            return {
              ...item,
              operations: Array.from(new Set((item.operations ?? []).concat(incomingAcl?.operations ?? []))),
            };
          }

          return item;
        });
        if (matchType === 'noMatch' || matchType === 'some') {
          this.props.updateACL(
            this.props.topicName,
            this.props.projectShortName,
            updatedAcl,
            () => {
              this.props.refreshACL();
            },
            'some',
          );
          return this.setState({ confirmAclAddText: '', incomingAcl: undefined, open: false, isAll: false });
        }

        return this.setState({ confirmAclAddText: '', incomingAcl: undefined });
      }
      default:
        return;
    }
  };

  render() {
    const { classes, aclRecords } = this.props;
    const { confirmAclAddText, matchType } = this.state;

    return (
      <React.Fragment>
        <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
          <IconButton onClick={this.handleClickOpen} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
            <AddIcon />
          </IconButton>
        </Grid>
        {this.state.open && (
          <Dialog open={true} onClose={this.handleClose} maxWidth={false} PaperComponent={PaperComponent} aria-labelledby="draggable-dialog-title">
            <ResizableBox height={350} width={600} className={classes.resizable}>
              <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                Добавление нового сертификата
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Введите DN сертификата и укажите операции, которые будут разрешены пользователям с этим сертификатом.
                </DialogContentText>
                <TextField
                  autoFocus
                  error={this.state.userSslCertificate === ''}
                  margin="dense"
                  id="DN"
                  label="DN"
                  placeholder={'CN=host.vm.esrt.cloud.sbrf.ru,OU=00CA,O=SberBank of the Russian Federation,L=Moscow,ST=Moscow,C=RU'}
                  onChange={(e) => {
                    this.setState({ userSslCertificate: e.target.value });
                  }}
                  value={this.state.userSslCertificate}
                  type="dn"
                  fullWidth
                />
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ALL</TableCell>
                      {this.state.allOperationTypes.map((type) => (
                        <TableCell key={type}>{type.toString()}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell padding="checkbox" size="small">
                        <Checkbox
                          defaultChecked={this.state.isAll}
                          checked={this.state.isAll}
                          onChange={(event) => {
                            if (event.target.checked) {
                              const operations = this.state.allOperationTypes;
                              this.setState({ isAll: true, operationTypes: operations });
                            } else {
                              this.setState({ isAll: false, operationTypes: [] });
                            }
                          }}
                        />
                      </TableCell>
                      {this.state.allOperationTypes.map((type) => {
                        return (
                          <TableCell key={type} padding="checkbox" size="small">
                            <Checkbox
                              defaultChecked={this.state.operationTypes.includes(type)}
                              checked={this.state.operationTypes.includes(type) || this.state.isAll}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  const operationTypes = this.state.operationTypes;
                                  operationTypes.push(type);
                                  if (operationTypes.length === 4) {
                                    this.setState({ operationTypes: operationTypes, isAll: true });
                                  } else {
                                    this.setState({ operationTypes: operationTypes });
                                  }
                                } else {
                                  const operationTypes = this.state.operationTypes.filter((typeIn) => {
                                    return typeIn !== type;
                                  });
                                  if (this.state.isAll) {
                                    this.setState({ operationTypes: operationTypes, isAll: false });
                                  } else {
                                    this.setState({ operationTypes: operationTypes });
                                  }
                                }
                              }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </DialogContent>
              <DialogActions style={{ marginTop: 6 }}>
                <Button onClick={this.handleClose} color="primary">
                  Отменить
                </Button>
                <Button
                  onClick={(e) => {
                    if (this.state.userSslCertificate === '' || this.state.operationTypes.length < 1) {
                      this.props.displayError('Не все поля заполнены!');
                      return;
                    }
                    const aclRecord: ClientACLRecord = {
                      userSslCertificate: this.state.userSslCertificate,
                      operations: this.state.operationTypes,
                    };

                    const findedExistingAcl = aclRecords.find((acl) => acl.userSslCertificate === aclRecord.userSslCertificate);

                    if (findedExistingAcl) {
                      const existingOps = findedExistingAcl.operations || [];
                      const incomingOps = aclRecord.operations || [];
                      const isEveryMatch = incomingOps.every((item) => existingOps.includes(item));

                      if (isEveryMatch) {
                        this.setState({
                          confirmAclAddText: 'Данная запись уже существует (все указанные права уже есть). Изменений не внесено.',
                          incomingAcl: aclRecord,
                          matchType: 'every',
                        });
                        return;
                      }
                      const isSomeMatch = incomingOps.some((item) => existingOps.includes(item));

                      if (isSomeMatch) {
                        this.setState({
                          confirmAclAddText: 'Указанный DN уже добавлен. Пересекающиеся ACL будут объединены. Вы уверены?',
                          incomingAcl: aclRecord,
                          matchType: 'some',
                        });
                        return;
                      }
                      this.setState({
                        confirmAclAddText: 'Указанный DN уже существует. Новые операции будут добавлены к текущим. Вы уверены?',
                        incomingAcl: aclRecord,
                        matchType: 'noMatch',
                      });
                      return;
                    }

                    this.handleClose();
                    this.props.addACL(this.props.topicName, this.props.projectShortName, [aclRecord], () => {
                      this.setState({ userSslCertificate: '', operationTypes: [], isAll: false });
                      this.props.refreshACL();
                    });
                  }}
                  color="primary"
                >
                  Добавить
                </Button>
              </DialogActions>
            </ResizableBox>
            <ConfirmDialog
              warningText={confirmAclAddText}
              open={Boolean(confirmAclAddText)}
              okString={matchType === 'every' ? 'Ок' : 'Да'}
              cancelString={matchType === 'every' ? null : 'Отмена'}
              onClose={this.handleConfirmAclAdd}
            />
          </Dialog>
        )}
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AddACLDialog);
