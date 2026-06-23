import * as React from 'react';
import 'react-table/react-table.css';
import { Paper } from '@material-ui/core';
import AceEditor from 'react-ace';

import 'brace/mode/xml';
import 'brace/mode/json';
import 'brace/theme/github';

export interface AddMessageFormProps {
  addRecord(value: string);
  addKey(key: string);
}

export default class AddMessageForm extends React.Component<AddMessageFormProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      key: '',
      value: '',
    };
  }

  render() {
    return (
      <React.Fragment>
        <p>Ключ:</p>
        <Paper style={{ padding: 4 }}>
          <AceEditor
            readOnly={false}
            mode="json"
            theme="github"
            height={'50px'}
            value={this.state.key}
            onChange={(e) => {
              this.setState({ key: e });
              this.props.addKey(e);
            }}
            highlightActiveLine
            width={'100%'}
            setOptions={{
              showLineNumbers: true,
              tabSize: 4,
            }}
          />
        </Paper>
        <p>Сообщение:</p>
        <Paper style={{ padding: 4 }}>
          <AceEditor
            readOnly={false}
            mode="json"
            theme="github"
            height={'350px'}
            value={this.state.value}
            onChange={(e) => {
              this.setState({ value: e });
              this.props.addRecord(e);
            }}
            highlightActiveLine
            width={'100%'}
            showPrintMargin
            setOptions={{
              showLineNumbers: true,
              tabSize: 4,
            }}
          />
        </Paper>
      </React.Fragment>
    );
  }
}
