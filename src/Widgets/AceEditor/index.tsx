import { FC } from 'react';
import Editor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-xcode';

interface AceEditorProps {
  id: string;
  value: string;
}

const AceEditor: FC<AceEditorProps> = ({ id, value }) => {
  return (
    <Editor
      defaultValue={'[]'}
      name={id}
      value={value}
      mode="json"
      width="100%"
      editorProps={{ $blockScrolling: true }}
      tabSize={2}
      fontSize={16}
      wrapEnabled
      readOnly
    />
  );
};

export default AceEditor;
