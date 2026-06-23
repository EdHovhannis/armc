import { Text, TextField } from '@sds-eng/base';
import { FC } from 'react';

import * as styles from './styles.module.css';

interface EditableInputFieldProps {
  edit: boolean;
  value: string;
  onChange: (value: string) => void;
}

const EditableInputField: FC<EditableInputFieldProps> = ({ value, onChange, edit }) => {
  return (
    <div className={styles.archiveEditableField}>
      {edit ? (
        <TextField size="sm" value={value} onChange={onChange} />
      ) : (
        <Text kind="bodyS" as="span" style={{ padding: '6px 8px', display: 'inline-block' }}>
          {value}
        </Text>
      )}
    </div>
  );
};

export default EditableInputField;
