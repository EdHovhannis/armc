import { Text } from '@sds-eng/base';
import { combine } from 'effector';
import { useUnit } from 'effector-react';
import { FC, useState } from 'react';

import ActiveCell from '@src/Shared/ui/ActiveCell';
import EditableSelectField from '@src/Shared/ui/EditableFields/EditableSelectField';

import { $dateFormats } from '@src/Entities/InputFormat/model';

interface DateFieldsProps {
  name: string;
  type: string;
  subType?: string;
  format?: string;
  edit: boolean;
  currentId: string;
  onEdit: (id: string | null) => void;
  onSave: (data: { name: string; type: string; subType?: string; format?: string }) => void;
}

const $dateFormatsOptions = combine($dateFormats, (dateFormats) => dateFormats.map((item) => ({ label: item, value: item })));

const DateFields: FC<DateFieldsProps> = ({ name, type, subType, format, edit, currentId, onEdit, onSave }) => {
  const [dateFormatsOptions] = useUnit([$dateFormatsOptions]);
  const [state, setState] = useState<{ name: string; type: string; subType?: string; format?: string }>({ name, type, subType, format });

  const currentFormat = state.format
    ? dateFormatsOptions.find((item) => item.value === state.format) || { label: state.format, value: state.format }
    : null;
  const canSave = Boolean(currentFormat?.value);

  return (
    <>
      <Text kind="bodyS" as="span" style={{ padding: '6px 8px', display: 'inline-block' }}>
        {name}
      </Text>
      <EditableSelectField edit={edit} value={currentFormat} options={dateFormatsOptions} onChange={(v) => setState({ ...state, format: v })} />
      <ActiveCell
        edit={edit}
        canSave={canSave}
        onSave={() => onSave(state)}
        onClose={() => {
          setState({ name, type, subType, format });
          onEdit(null);
        }}
        onEdit={() => onEdit(currentId)}
      />
    </>
  );
};

export default DateFields;
