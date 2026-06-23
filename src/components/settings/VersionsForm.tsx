import MaterialTable from '@material-table/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import * as React from 'react';

import { Versions } from '../../store/config/Types';
import { tableIcons } from '../../utils/Utils';

export interface VersionsFormProps {
  flowVersion: Versions[] | string;
  indexVersion: Versions[] | string;
  kafkaVersion: Versions[] | string;
  monitoringVersion: Versions[] | string;
  archiveVersion: Versions[] | string;
  pvmBaseVersion: Versions[] | string;
  clientApiVersion: Versions[] | string;
  traceVersion: Versions[] | string;
  pvmAuthVersion: Versions[] | string;
}

export interface VersionsFormState {
  versions: Map<string, Versions[]>;
}

export default class VersionsForm extends React.Component<VersionsFormProps, VersionsFormState> {
  constructor(props) {
    super(props);

    this.state = {
      versions: this.initVersions(),
    };

    this.initVersions = this.initVersions.bind(this);
  }

  initVersions(): Map<string, Versions[]> {
    const versions: Map<string, Versions[]> = new Map<string, Versions[]>();
    if (this.props.archiveVersion) {
      versions['Archive Index Service'] = this.props.archiveVersion;
    }
    if (this.props.monitoringVersion) {
      versions['Analytic Index Service'] = this.props.monitoringVersion;
    }
    if (this.props.flowVersion) {
      versions['Flow Service'] = this.props.flowVersion;
    }
    if (this.props.clientApiVersion) {
      versions['Client Api Service'] = this.props.clientApiVersion;
    }
    if (this.props.indexVersion) {
      versions['Fulltext Index Service'] = this.props.indexVersion;
    }
    if (this.props.kafkaVersion) {
      versions['Kafka Service'] = this.props.kafkaVersion;
    }
    if (this.props.pvmBaseVersion) {
      versions['PVM Base Service'] = this.props.pvmBaseVersion;
    }
    if (this.props.pvmAuthVersion) {
      versions['PVM Auth Service'] = this.props.pvmAuthVersion;
    }
    if (this.props.traceVersion) {
      versions['Trace Query Service'] = this.props.traceVersion;
    }
    return versions;
  }

  render() {
    return (
      <React.Fragment>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Paper style={{ width: '100%', marginTop: 16 }}>
            <MaterialTable
              icons={tableIcons}
              columns={[
                {
                  title: 'Название сервиса',
                  field: 'service',
                },
                {
                  title: 'Версии',
                  field: 'version',
                  searchable: false,
                  render: (rowData) => {
                    if (rowData.version.constructor === Array) {
                      return (
                        <React.Fragment>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>artifact</TableCell>
                                <TableCell>version</TableCell>
                                <TableCell>gitCommitHash</TableCell>
                                <TableCell>timestamp</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rowData.version.map((data: Versions) => {
                                return (
                                  <TableRow key={data.gitCommitHash}>
                                    <TableCell>{data.artifact}</TableCell>
                                    <TableCell>{data.version}</TableCell>
                                    <TableCell>{data.gitCommitHash}</TableCell>
                                    <TableCell>{data.timestamp}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </React.Fragment>
                      );
                    } else {
                      return <React.Fragment>{rowData.version}</React.Fragment>;
                    }
                  },
                },
              ]}
              localization={{
                header: {
                  actions: '',
                },
              }}
              data={Object.keys(this.state.versions).map((key) => {
                return { service: key, version: this.state.versions[key] };
              })}
              title="Версии сервисов"
              options={{
                search: true,
                paging: false,
                showTitle: true,
                header: true,
              }}
            />
          </Paper>
        </div>
      </React.Fragment>
    );
  }
}
