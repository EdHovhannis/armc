import { Checkbox } from '@sds-eng/base';
import { FC, useState } from 'react';

import { SCHEMA_TYPE_FIELDS } from '@src/Shared/constants/options';
import ActiveCell from '@src/Shared/ui/ActiveCell';
import EditableInputField from '@src/Shared/ui/EditableFields/EditableInputField';
import EditableSelectField from '@src/Shared/ui/EditableFields/EditableSelectField';

interface FilterMessageProps {
  field: string;
  value: string;
  type: string;
  inverted: boolean;
  edit: boolean;
  currentId: string;
  onEdit: (id: string | null) => void;
  onRemove: () => void;
  onSave: (data: { field: string; value: string; type: string; inverted: boolean }) => void;
}

const FilterMessage: FC<FilterMessageProps> = ({ field, value, type, inverted, edit, currentId, onEdit, onRemove, onSave }) => {
  const [state, setState] = useState<{ field: string; value: string; type: string; inverted: boolean }>({ field, value, type, inverted });

  const currentType = state.type ? SCHEMA_TYPE_FIELDS.find((item) => item.value === state.type) || { label: state.type, value: state.type } : null;
  const canSave = Boolean(state.field && state.value && state.type);

  return (
    <>
      <EditableInputField edit={edit} value={state.field} onChange={(v) => setState({ ...state, field: v })} />
      <EditableInputField edit={edit} value={state.value} onChange={(v) => setState({ ...state, value: v })} />
      <EditableSelectField edit={edit} value={currentType} options={SCHEMA_TYPE_FIELDS} onChange={(v) => setState({ ...state, type: v })} />
      <div style={{ padding: '14px 4px' }}>
        <Checkbox disabled={!edit} checked={state.inverted} onChange={() => setState({ ...state, inverted: !state.inverted })} />
      </div>
      <ActiveCell
        edit={edit}
        canSave={canSave}
        onSave={() => onSave(state)}
        onClose={() => {
          setState({ field, value, type, inverted });
          onEdit(null);
        }}
        onEdit={() => onEdit(currentId)}
        onRemove={onRemove}
      />
    </>
  );
};

export default FilterMessage;
