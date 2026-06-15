import { Select, Text } from '@sds-eng/base';
import { FC } from 'react';

import { OptionItemType } from '@src/Shared/types/filter';

import * as styles from './styles.module.css';

interface EditableSelectFieldProps {
  edit: boolean;
  value: OptionItemType | null;
  options: OptionItemType[];
  onChange: (value: string) => void;
}

const EditableSelectField: FC<EditableSelectFieldProps> = ({ value, options, onChange, edit }) => {
  return (
    <div className={styles.archiveEditableField}>
      {edit ? (
        <Select size="sm" value={value} options={options} onChange={onChange} />
      ) : (
        <Text kind="bodyS" as="span" style={{ padding: '6px 8px', display: 'inline-block' }}>
          {value?.label}
        </Text>
      )}
    </div>
  );
};

export default EditableSelectField;
