import * as React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Paper } from '@material-ui/core';

import { KafkaRecord } from '../../../store/kafkaViewer/Types';

export interface TopicRowsFormProps {
  records: Array<KafkaRecord>;
}

export interface TopicRowsFormDispatchProps {
  recordSelected(record: string);
}

export interface TopicRowsFormState {
  selectedRow: number;
}

export default class TopicRowsForm extends React.Component<TopicRowsFormProps & TopicRowsFormDispatchProps, TopicRowsFormState> {
  constructor(props) {
    super(props);
    this.state = {
      selectedRow: -1,
    };
  }

  render() {
    return (
      <Paper style={{ height: '100%' }}>
        <ReactTable
          defaultPageSize={15}
          style={{ height: '100%' }}
          columns={[
            {
              Header: 'Offset',
              accessor: 'offset',
              maxWidth: 100,
              style: this.getTableFonts(),
            },
            {
              Header: 'Timestamp',
              accessor: 'timestamp',
              maxWidth: 150,
              style: this.getTableFonts(),
            },
            {
              Header: 'Partition',
              accessor: 'partitions',
              maxWidth: 50,
              style: this.getTableFonts(),
            },
            {
              Header: 'Key',
              accessor: 'key',
              show: 'data.key',
              maxWidth: 100,
              style: this.getTableFonts(),
            },
            {
              Header: 'Value',
              accessor: 'value',
              minWidth: 200,
              style: this.getTableFonts(),
            },
          ]}
          getTrProps={(state, rowInfo, column) => {
            if (!rowInfo) return {};
            return {
              onClick: (event, handleOriginal) => {
                this.setState({
                  selectedRow: rowInfo.index,
                });
                this.props.recordSelected(rowInfo.row.value);
              },
              style: {
                backgroundColor: this.state.selectedRow === rowInfo.index ? '#4caf50' : null,
              },
            };
          }}
          data={this.props.records}
        ></ReactTable>
      </Paper>
    );
  }

  getTableFonts() {
    return {
      fontFamily: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      fontSize: 12,
    };
  }
}
