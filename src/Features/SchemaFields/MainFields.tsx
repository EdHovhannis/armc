import { FC, useState } from 'react';

import { SCHEMA_FIELDS, SCHEMA_SUB_FIELDS } from '@src/Shared/constants/options';
import ActiveCell from '@src/Shared/ui/ActiveCell';
import EditableInputField from '@src/Shared/ui/EditableFields/EditableInputField';
import EditableSelectField from '@src/Shared/ui/EditableFields/EditableSelectField';

interface MainFieldsProps {
  name: string;
  type: string;
  subType?: string;
  format?: string;
  edit: boolean;
  currentId: string;
  onEdit: (id: string | null) => void;
  onRemove: () => void;
  onSave: (data: { name: string; type: string; subType?: string }) => void;
}

const MainFields: FC<MainFieldsProps> = ({ name, type, subType, format, edit, currentId, onEdit, onRemove, onSave }) => {
  const [state, setState] = useState<{ name: string; type: string; subType?: string; format?: string }>({ name, type, subType, format });

  const currentType = SCHEMA_FIELDS.find((item) => item.value === state.type) || null;
  const currentSubType = SCHEMA_SUB_FIELDS.find((item) => item.value === state.subType) || null;
  const canSave = Boolean(state.name && state.type && (state.type !== 'ARRAY' || (state.type === 'ARRAY' && state.subType)));

  return (
    <>
      <EditableInputField edit={edit} value={state.name} onChange={(v) => setState({ ...state, name: v })} />
      <EditableSelectField
        edit={edit}
        value={currentType}
        options={SCHEMA_FIELDS}
        onChange={(v) => setState({ ...state, type: v, subType: undefined })}
      />
      <EditableSelectField
        edit={edit && state.type === 'ARRAY'}
        value={currentSubType}
        options={SCHEMA_SUB_FIELDS}
        onChange={(v) => setState({ ...state, subType: v })}
      />
      <ActiveCell
        edit={edit}
        canSave={canSave}
        onSave={() => onSave(state)}
        onClose={() => {
          setState({ name, type, subType });
          onEdit(null);
        }}
        onEdit={() => onEdit(currentId)}
        onRemove={onRemove}
      />
    </>
  );
};

export default MainFields;
