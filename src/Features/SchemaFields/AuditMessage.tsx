import { FC, useState } from 'react';

import { SCHEMA_AUDIT_FIELDS } from '@src/Shared/constants/options';
import ActiveCell from '@src/Shared/ui/ActiveCell';
import EditableInputField from '@src/Shared/ui/EditableFields/EditableInputField';
import EditableSelectField from '@src/Shared/ui/EditableFields/EditableSelectField';

interface AuditMessageProps {
  auditParamsArrayFieldName: string;
  auditParamName: string;
  fieldWithAuditParamName: string;
  fieldWithAuditParamValue: string;
  resultFieldName: string;
  resultFieldType: string;
  fullState: boolean;
  edit: boolean;
  currentId: string;
  onEdit: (id: string | null) => void;
  onRemove: () => void;
  onSave: (data: {
    auditParamsArrayFieldName: string;
    auditParamName: string;
    fieldWithAuditParamName: string;
    fieldWithAuditParamValue: string;
    resultFieldName: string;
    resultFieldType: string;
  }) => void;
}

const AuditMessage: FC<AuditMessageProps> = ({
  auditParamsArrayFieldName,
  auditParamName,
  fieldWithAuditParamName,
  fieldWithAuditParamValue,
  resultFieldName,
  resultFieldType,
  edit,
  fullState,
  currentId,
  onEdit,
  onRemove,
  onSave,
}) => {
  const [state, setState] = useState<{
    auditParamsArrayFieldName: string;
    auditParamName: string;
    fieldWithAuditParamName: string;
    fieldWithAuditParamValue: string;
    resultFieldName: string;
    resultFieldType: string;
  }>({ auditParamsArrayFieldName, auditParamName, fieldWithAuditParamName, fieldWithAuditParamValue, resultFieldName, resultFieldType });

  const currentType = state.resultFieldType
    ? SCHEMA_AUDIT_FIELDS.find((item) => item.value === state.resultFieldType) || { label: state.resultFieldType, value: state.resultFieldType }
    : null;
  const canSave = Boolean(
    state.auditParamsArrayFieldName &&
    state.auditParamName &&
    state.fieldWithAuditParamName &&
    state.fieldWithAuditParamValue &&
    state.resultFieldType,
  );

  return (
    <>
      <EditableInputField
        edit={edit}
        value={state.auditParamsArrayFieldName}
        onChange={(v) => setState({ ...state, auditParamsArrayFieldName: v })}
      />
      <EditableInputField edit={edit} value={state.auditParamName} onChange={(v) => setState({ ...state, auditParamName: v })} />
      {fullState && (
        <>
          <EditableInputField
            edit={edit}
            value={state.fieldWithAuditParamName}
            onChange={(v) => setState({ ...state, fieldWithAuditParamName: v })}
          />
          <EditableInputField
            edit={edit}
            value={state.fieldWithAuditParamValue}
            onChange={(v) => setState({ ...state, fieldWithAuditParamValue: v })}
          />
          <EditableInputField edit={edit} value={state.resultFieldName} onChange={(v) => setState({ ...state, resultFieldName: v })} />
          <EditableSelectField
            edit={edit}
            value={currentType}
            options={SCHEMA_AUDIT_FIELDS}
            onChange={(v) => setState({ ...state, resultFieldType: v })}
          />
        </>
      )}
      <ActiveCell
        edit={edit}
        canSave={canSave}
        onSave={() => onSave(state.resultFieldName ? state : { ...state, resultFieldName: state.auditParamName })}
        onClose={() => {
          setState({
            auditParamsArrayFieldName,
            auditParamName,
            fieldWithAuditParamName,
            fieldWithAuditParamValue,
            resultFieldName,
            resultFieldType,
          });
          onEdit(null);
        }}
        onEdit={() => onEdit(currentId)}
        onRemove={onRemove}
      />
    </>
  );
};

export default AuditMessage;
