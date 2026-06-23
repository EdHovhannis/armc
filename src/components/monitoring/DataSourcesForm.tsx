import { Grid } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import * as React from 'react';

import { DruidDatasource } from '../../store/monitoring/Types';

export interface DataSourcesFormProps {
  datasources: Array<DruidDatasource>;
}

export default class DataSourcesForm extends React.Component<DataSourcesFormProps, any> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Grid container style={{ width: '100%', marginTop: 6 }} justifyContent="space-between" alignItems="center" direction="column">
        <Grid item style={{ width: '100%' }}>
          <Paper style={{ overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>DataSource</TableCell>
                  <TableCell>Доступность</TableCell>
                  <TableCell>Объём</TableCell>
                  <TableCell>Кол-во записей</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.datasources &&
                  this.props.datasources.map((datasource) => {
                    return (
                      <TableRow key={datasource.datasource} hover>
                        <TableCell>{datasource.datasource}</TableCell>
                        <TableCell>{datasource.num_available_segments + ' / ' + datasource.num_segments}</TableCell>
                        <TableCell>{DataSourcesForm.formatBytes(datasource.size)}</TableCell>
                        <TableCell>{DataSourcesForm.formatNumber(datasource.num_rows)}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  static formatBytes(bytes, decimals = 2) {
    if (bytes == 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  static formatNumber(number) {
    let target = '';
    let i = 0;
    while (number > 0) {
      if (i == 3) {
        target += '.';
        i = 0;
      }
      target += number % 10;
      number = Math.floor(number / 10);
      i++;
    }
    return target.split('').reverse().join('');
  }
}
