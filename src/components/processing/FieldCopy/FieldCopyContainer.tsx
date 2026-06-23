import { Localization, Options } from '@material-table/core';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { FC, useEffect, useState } from 'react';

import { ArchiveProcessing } from '../../../store/archive/Types';
import { ProcessingPipeline } from '../../../store/pipeline/Types';

import { FieldCopyView } from './FieldCopyView';
import { ICopyAuditParams, ITableValidate } from './types';
import { copyFieldTypes, validateRow } from './utils';

interface IFieldCopyContainer {
  isArchive?: boolean;
  processing: ProcessingPipeline | ArchiveProcessing;
  processingChanged(processing: ProcessingPipeline | ArchiveProcessing): any;
}

export const FieldCopyContainer: FC<IFieldCopyContainer> = ({ isArchive, processing, processingChanged }: IFieldCopyContainer) => {
  const [copyFields, setCopyFields] = useState<ICopyAuditParams[]>(processing.copyAuditParams?.copyAuditParamsSpecs ?? []);
  const [extraFieldsVisisbe, setExtraFieldsVisible] = useState<boolean>(false);
  const [editedFieldName, setEditedFieldName] = useState<number[]>([]);

  const defaultParams = (id: number): ICopyAuditParams => ({
    auditParamsArrayFieldName: 'params',
    auditParamName: '',
    fieldWithAuditParamName: 'name',
    fieldWithAuditParamValue: 'value',
    resultFieldName: '',
    resultFieldType: 'STRING',
    tableData: {
      id: id,
      editing: 'update',
    },
  });

  const localization: Localization = {
    body: {
      emptyDataSourceMessage: 'Поля для копирования отсутствуют',
      addTooltip: 'Добавить поле для копирования',
      deleteTooltip: 'Удалить поле для копирования',
      editTooltip: 'Редактировать',
      editRow: {
        deleteText: 'Удалить поле для копирования?',
        cancelTooltip: 'Отмена',
        saveTooltip: 'Подтвердить',
      },
    },
    header: {
      actions: '',
    },
  };

  const tableOptions: Options<ICopyAuditParams> = {
    actionsColumnIndex: -1,
    paging: false,
    search: false,
    sorting: false,
    toolbar: false,
    showTitle: false,
    draggable: false,
    toolbarButtonAlignment: 'left',
  };

  useEffect(() => {
    let editedFields: number[] = [];

    // Запрещаем копировать значение в Наименование итогового поля,
    // если значения Наименование итогового поля и Поле для копирования не совпадают
    copyFields.forEach((fields, index) => {
      if (fields.auditParamName !== fields.resultFieldName) editedFields = [...editedFields, index];
    });

    setEditedFieldName(editedFields);
  }, []);

  const copyFieldsHandler = (fields: ICopyAuditParams[]) => {
    let updatedProcessing = { ...processing };

    updatedProcessing = {
      ...processing,
      ...{
        copyAuditParams: {
          copyAuditParamsSpecs: cloneDeep(fields).map((row) => {
            delete row.tableData;
            return row;
          }),
        },
      },
    };

    setCopyFields(fields);
    processingChanged(updatedProcessing);
  };

  const onRowAdd = (): Promise<void> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        let editing = false;
        copyFields.forEach((obj) => {
          if (obj.tableData?.editing === 'update') {
            editing = true;
            return;
          }
        });

        if (!editing) {
          copyFieldsHandler([...copyFields, defaultParams(copyFields.length++)]);
          resolve();
        } else {
          reject();
        }
      }, 10);
    });

  const onRowUpdate = (newData: ICopyAuditParams, oldData?: ICopyAuditParams): Promise<void> =>
    new Promise((resolve) => {
      setTimeout(() => {
        const fieldsData = [...copyFields];
        const index = oldData?.tableData?.id as number;
        fieldsData[index] = newData;

        // Запрещаем копировать значение в Наименование итогового поля, если оно было изменено
        let editedResultFieldName = false;
        if (newData.resultFieldName !== oldData?.resultFieldName) {
          editedResultFieldName = true;
          setEditedFieldName([...editedFieldName, index]);
        }

        if (
          (!editedFieldName.includes(index) && !editedResultFieldName) || // Если поле Наименование итогового поля не изменялось
          !fieldsData[index].resultFieldName // ... или если оно пустое
        ) {
          fieldsData[index].resultFieldName = newData.auditParamName; // ... то берем значение для него из Поле для копирования
        }

        copyFieldsHandler(fieldsData);
        resolve();
      }, 10);
    });

  const onRowDelete = (oldData: ICopyAuditParams): Promise<void> =>
    new Promise((resolve) => {
      setTimeout(() => {
        const index = oldData?.tableData?.id as number;
        const fieldsData = [...copyFields];

        fieldsData.splice(index, 1);
        copyFieldsHandler(fieldsData);

        const updatedEditedFields = editedFieldName.filter((i) => i !== index);
        setEditedFieldName(updatedEditedFields);

        resolve();
      }, 10);
    });

  const onRowUpdateCancelled = (): void => {
    const fieldsData = [...copyFields];
    const index = fieldsData.length - 1;
    const isValid = validateRow(fieldsData[index]);

    if (isValid !== true) {
      fieldsData.splice(index, 1);
      copyFieldsHandler(fieldsData);
    }
  };

  const validateHandler = (field: string, rowData: ICopyAuditParams): boolean | ITableValidate => {
    const isValid = validateRow(rowData);
    if (isValid === true) return isValid;

    const invalidStatus: ITableValidate = {
      isValid: false,
      helperText: 'Недопустимое значение',
    };

    const invalidFields = isValid as string[];
    return invalidFields.includes(field) ? invalidStatus : true;
  };

  const extraFieldsVisisbeHandler = (): void => setExtraFieldsVisible(!extraFieldsVisisbe);

  const fieldTypes = isArchive ? copyFieldTypes.filter((v) => v !== 'UUID') : copyFieldTypes;

  return (
    <FieldCopyView
      data={copyFields}
      copyFieldTypes={fieldTypes}
      localization={localization}
      tableOptions={tableOptions}
      extraFieldsVisisbe={extraFieldsVisisbe}
      onRowAdd={onRowAdd}
      onRowUpdate={onRowUpdate}
      onRowDelete={onRowDelete}
      onRowUpdateCancelled={onRowUpdateCancelled}
      extraFieldsVisisbeHandler={extraFieldsVisisbeHandler}
      validateHandler={validateHandler}
    />
  );
};
