import {
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  withStyles,
} from '@material-ui/core';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { ClientACLRecord, OperationType } from '../../store/kafka/Types';

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

export interface ClientACLRecordForEdit extends ClientACLRecord {
  oldSslCertificate?: string;
}

export interface EditACLDialogProps {
  aclRecord?: ClientACLRecord;
  open: boolean;

  displayError(msg: string): any;

  onClose(value: string, aclRecord?: ClientACLRecordForEdit): any;

  close(value: boolean): any;
  classes: any;
}

export interface EditACLDialogState {
  allOperationTypes: Array<OperationType>;
  operationTypes?: Array<OperationType>;
  isAll: boolean;
  sslCertificate?: string;
  aclRecord?: ClientACLRecord;
}

class EditACLDialog extends React.Component<EditACLDialogProps, EditACLDialogState> {
  constructor(props) {
    super(props);
    const allOperations: Array<OperationType> = new Array<OperationType>();
    for (const type in OperationType) allOperations.push(type as OperationType);
    this.state = {
      isAll: false,
      allOperationTypes: allOperations,
      sslCertificate: this.props.aclRecord ? this.props.aclRecord.userSslCertificate : undefined,
      operationTypes: this.props.aclRecord ? this.props.aclRecord.operations : [],
      aclRecord: this.props.aclRecord,
    };
  }

  componentDidUpdate(prevProps: any) {
    if (this.props.open && prevProps.aclRecord !== this.props.aclRecord) {
      const { aclRecord } = this.props;

      this.setState({
        aclRecord: aclRecord,
        sslCertificate: aclRecord?.userSslCertificate,
        operationTypes: aclRecord?.operations || [],
        isAll: aclRecord?.operations?.length === this.state.allOperationTypes.length,
      });
    }
  }

  render() {
    const { classes, aclRecord: aclRecordProps } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={this.props.open}
          onClose={this.props.onClose('Cancel')}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox height={350} width={600} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Редактирование операций
            </DialogTitle>
            <DialogContent>
              <DialogContentText>Укажите операции, которые будут разрешены пользователям с этим сертификатом.</DialogContentText>
              <TextField
                margin="dense"
                id="dn"
                label="DN"
                disabled={true}
                onChange={(e) => {
                  this.setState({ sslCertificate: e.target.value });
                }}
                value={this.state.sslCertificate}
                defaultValue={this.state.sslCertificate}
                type="dn"
                fullWidth
              />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ALL</TableCell>
                    {this.state.allOperationTypes.map((type) => (
                      <TableCell>{type.toString()}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell padding="checkbox" size="small">
                      <Checkbox
                        defaultChecked={this.state.isAll}
                        checked={this.state.operationTypes?.length === 3}
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
                    {this.state.allOperationTypes.map((type, i) => {
                      return (
                        <TableCell key={i} padding="checkbox" size="small">
                          <Checkbox
                            defaultChecked={this.state.operationTypes && this.state.operationTypes.includes(type)}
                            checked={this.state.operationTypes && this.state.operationTypes.includes(type)}
                            onChange={(event) => {
                              const { operationTypes } = this.state;
                              if (event.target.checked) {
                                if (Array.isArray(operationTypes)) {
                                  this.setState({ operationTypes: [...operationTypes, type] });
                                }
                              } else {
                                const filteredOperationTypes = operationTypes?.filter((typeIn) => typeIn !== type);
                                this.setState({ operationTypes: filteredOperationTypes });
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
              <Button
                onClick={(e) => {
                  this.props.onClose('Cancel');
                  this.props.close(false);
                  this.setState({ operationTypes: aclRecordProps?.operations });
                }}
                color="primary"
              >
                Отменить
              </Button>
              <Button
                onClick={(e) => {
                  this.props.onClose('Delete', this.props.aclRecord as ClientACLRecordForEdit);
                  this.props.close(false);
                }}
                color="primary"
              >
                Удалить
              </Button>
              <Button
                onClick={(e) => {
                  if (!this.state.operationTypes?.length) {
                    this.props.displayError('Нужно указать хотя бы одну операцию');
                    return;
                  }
                  const aclRecord: ClientACLRecordForEdit = {
                    userSslCertificate: this.state.sslCertificate,
                    operations: this.state.operationTypes,
                    oldSslCertificate: this.state.aclRecord?.userSslCertificate,
                  };
                  this.props.onClose('Ok', aclRecord as ClientACLRecordForEdit);
                  this.props.close(false);
                }}
                color="primary"
              >
                Сохранить
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(EditACLDialog);
