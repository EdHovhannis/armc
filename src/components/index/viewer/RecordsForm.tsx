import { Paper } from '@material-ui/core';
import * as React from 'react';
import ReactTable from 'react-table';

import { Field } from '../../../store/index/Types';
import 'react-table/react-table.css';

const translations = {
  previousText: 'Предыдущая',
  nextText: 'Следующая',
  noDataText: 'Данных нет',
  pageText: 'Страница',
  ofText: 'из',
  rowsText: 'записей',
};

export interface RecordsFormProps {
  data: any[];
  fields: Field[];
  defaultPageSize: number;
  changeDefaultPageSize: (defaultPageSize: number) => void;

  recordSelected(record: any);
}

export interface RecordsFormStat {
  selectedRecord: any;
  selectedRow: number;
}

export class RecordsForm extends React.Component<RecordsFormProps, RecordsFormStat> {
  constructor(props) {
    super(props);
    this.state = {
      selectedRecord: undefined,
      selectedRow: -1,
    };
  }

  render() {
    return (
      <Paper style={{ height: '100%' }}>
        <ReactTable
          {...translations}
          defaultPageSize={this.props.defaultPageSize}
          style={{ height: '100%' }}
          columns={
            this.props.fields.length === 0
              ? ['']
              : this.props.fields
                  .filter((field) => field.name !== 'tengriId')
                  .map((field) => {
                    return {
                      Header: () => <div style={{ textAlign: 'left' }}>{field.name}</div>,
                      accessor: (d) => d[field.name], // example key first.column
                      id: field.name,
                      style: this.getTableFonts(),
                      Cell: (props) => {
                        const { value } = props;
                        if (typeof value === 'string') return <>{value}</>;
                        return <>{value?.toString()}</>;
                      },
                    };
                  })
          }
          getTrProps={(state, rowInfo, column) => {
            if (!rowInfo) return {};
            return {
              onClick: (event, handleOriginal) => {
                this.setState({
                  selectedRow: rowInfo.index,
                  selectedRecord: rowInfo.original,
                });
                this.props.recordSelected(rowInfo.original);
              },
              style: {
                backgroundColor: this.state.selectedRow === rowInfo.index ? '#4caf50' : null,
              },
            };
          }}
          onPageSizeChange={(e) => {
            this.props.changeDefaultPageSize(e);
          }}
          data={this.props.data}
        />
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
