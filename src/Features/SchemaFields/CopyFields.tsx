import { FC, useState } from 'react';

import { OptionItemType } from '@src/Shared/types/filter';
import ActiveCell from '@src/Shared/ui/ActiveCell';
import EditableInputField from '@src/Shared/ui/EditableFields/EditableInputField';
import EditableSelectField from '@src/Shared/ui/EditableFields/EditableSelectField';

interface CopyFieldsProps {
  from: string;
  to: string[];
  options: OptionItemType[];
  edit: boolean;
  currentId: string;
  onEdit: (id: string | null) => void;
  onRemove: () => void;
  onSave: (data: { from: string; to: string[] }) => void;
}

const CopyFields: FC<CopyFieldsProps> = ({ from, to, edit, options, currentId, onEdit, onRemove, onSave }) => {
  const [state, setState] = useState<{ from: string; to: string[] }>({ from, to });

  const currentType = state.to[0] ? options.find((item) => item.value === state.to[0]) || { label: state.to[0], value: state.to[0] } : null;
  const canSave = Boolean(state.from && state.to.length);

  return (
    <>
      <EditableInputField edit={edit} value={state.from} onChange={(v) => setState({ ...state, from: v })} />
      <EditableSelectField edit={edit} value={currentType} options={options} onChange={(v) => setState({ ...state, to: [v] })} />
      <ActiveCell
        edit={edit}
        canSave={canSave}
        onSave={() => onSave(state)}
        onClose={() => {
          setState({ from, to });
          onEdit(null);
        }}
        onEdit={() => onEdit(currentId)}
        onRemove={onRemove}
      />
    </>
  );
};

export default CopyFields;
