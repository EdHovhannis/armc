import * as React from 'react';
import 'react-table/react-table.css';
import { Paper } from '@material-ui/core';
import AceEditor from 'react-ace';

import 'brace/mode/xml';
import 'brace/mode/json';
import 'brace/theme/github';

export interface TopicRowDetailFormProps {
  selectedRow: string;
  isJSON: boolean;
}

export default class TopicRowDetailForm extends React.Component<TopicRowDetailFormProps, any> {
  render() {
    return (
      <Paper style={{ padding: 8 }}>
        <AceEditor
          readOnly={true}
          mode="json"
          theme="github"
          onChange={(e) => {}}
          value={this.props.isJSON ? JSON.stringify(this.props.selectedRow, null, '\t') : this.props.selectedRow}
          highlightActiveLine
          width={'100%'}
          showPrintMargin
          setOptions={{
            showLineNumbers: true,
            tabSize: 4,
          }}
        />
      </Paper>
    );
  }
}
