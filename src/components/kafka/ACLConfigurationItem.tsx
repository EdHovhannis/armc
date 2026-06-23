import { Paper } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Check, Remove } from '@material-ui/icons';
import * as React from 'react';
import { Link } from 'react-router';

import { ClientACLRecord, OperationType } from '../../store/kafka/Types';

import AddACLDialog from './AddACLDialog';
import EditACLDialog from './EditACLDialog';

export interface ACLConfigurationItemProps {
  canEdit: boolean;
  topicName: string;
  projectShortName: string;
  aclRecords: Array<ClientACLRecord>;

  refreshACL(): any;

  displayError: (msg: string) => void;
  addACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?) => void;
  deleteACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?) => void;
  updateACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?) => void;
}

export interface ACLConfigurationItemState {
  aclRecords: Array<ClientACLRecord>;
  prevAclRecords: Array<ClientACLRecord>;
  operationTypes: Array<OperationType>;
  openEdit: boolean;
  currentRecord?: ClientACLRecord;
}

export default class ACLConfigurationItem extends React.Component<ACLConfigurationItemProps, ACLConfigurationItemState> {
  constructor(props) {
    super(props);
    const operations: Array<OperationType> = new Array<OperationType>();
    for (const type in OperationType) operations.push(type as OperationType);

    this.state = {
      operationTypes: operations,
      openEdit: false,
      aclRecords: this.props.aclRecords,
      prevAclRecords: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.aclRecords !== state.aclRecords) {
      return {
        prevAclRecords: props.aclRecords,
        aclRecords: props.aclRecords,
      };
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.renderAclTable()}
        {this.renderCNInput()}
      </React.Fragment>
    );
  }

  renderCNInput() {
    if (!this.props.canEdit) {
      return null;
    }
    return (
      <React.Fragment>
        <AddACLDialog
          refreshACL={this.props.refreshACL}
          projectShortName={this.props.projectShortName}
          topicName={this.props.topicName}
          displayError={this.props.displayError}
          addACL={this.props.addACL}
          aclRecords={this.props.aclRecords}
          updateACL={this.props.updateACL}
        />
      </React.Fragment>
    );
  }

  renderAclTable() {
    return (
      <React.Fragment>
        <Paper style={{ overflow: 'auto', width: '100%', marginTop: 12 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell size="small">DN</TableCell>
                {this.state.operationTypes.map((type) => (
                  <TableCell key={type}>{type.toString()}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.aclRecords &&
                this.state.aclRecords.map((record) => {
                  return (
                    <TableRow
                      key={record.userSslCertificate}
                      style={{ textDecoration: 'none', cursor: 'pointer' }}
                      onClick={() => {
                        this.setState({ openEdit: true, currentRecord: record });
                      }}
                    >
                      <TableCell size="small">{record.userSslCertificate}</TableCell>
                      {this.state.operationTypes.map((type) => {
                        return (
                          <TableCell key={type} padding="checkbox" size="small">
                            <Checkbox
                              defaultChecked={record.operations?.includes(type)}
                              icon={<Remove />}
                              checkedIcon={<Check />}
                              value={record.operations?.includes(type)}
                              checked={record.operations?.includes(type)}
                              disabled
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Paper>
        <EditACLDialog
          aclRecord={this.state.currentRecord}
          open={this.state.openEdit}
          displayError={this.props.displayError}
          onClose={(value: any, aclRecord: any) => {
            if (value === 'Cancel') {
              return;
            }
            if (value === 'Delete' && aclRecord) {
              this.props.deleteACL(this.props.topicName, this.props.projectShortName, [aclRecord], () => {
                this.props.refreshACL();
              });
            }

            if (value === 'Ok' && aclRecord) {
              const updatedData = this.props.aclRecords.map((item) =>
                item.userSslCertificate === this.state.currentRecord?.userSslCertificate ? aclRecord : item,
              );
              this.props.updateACL(this.props.topicName, this.props.projectShortName, updatedData, () => {
                this.setState({ aclRecords: updatedData });
                this.props.refreshACL();
              });
            }
          }}
          close={(value: any) => {
            this.setState({ openEdit: value });
          }}
        />
      </React.Fragment>
    );
  }
}
