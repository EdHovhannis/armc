import MaterialTable, { MTableToolbar } from '@material-table/core';
import { Grid, TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import { useMemo } from 'react';

import { ProcessingPipeline, SchemaPipeline, TimestampNode } from '../../../../store/pipeline/Types';
import { PipelineUtils } from '../../../../utils/PipelineUtils';
import { tableIconsWithInvisibleAdd } from '../../../../utils/Utils';
import { WrongInput } from '../../../index/CreateIndexPage';
import { TransformArrayData } from '../types';

export interface ITransformArrayDates {
  dateFormats: string[];
  timeZones: string[];
  processing: ProcessingPipeline;

  processingChanged(processing: ProcessingPipeline): any;

  displayError(msg: string): void;
}

const LOCAL_DATE = {
  toolbar: {
    searchTooltip: 'Поиск',
    searchPlaceholder: 'Найти нужное поле',
  },
  body: {
    emptyDataSourceMessage: 'Полей с типом "Дата" в схеме нет',
    addTooltip: '',
    editTooltip: 'Редактировать',
    editRow: {
      cancelTooltip: 'Отмена',
      saveTooltip: 'Подтвердить',
    },
  },
  header: {
    actions: '',
  },
};

export const PipelineTransformArrayDates: React.FC<ITransformArrayDates> = ({
  processingChanged,
  dateFormats,
  processing,
  timeZones,
  displayError,
}: ITransformArrayDates) => {
  const checkWrongInput = (processing: ProcessingPipeline, schema?: SchemaPipeline): WrongInput => {
    const wrongInput: WrongInput = {
      wrongInput: false,
      message: '',
    };
    processing.convertTimestampParams?.forEach((timestampNode) => {
      if (timestampNode.inputFormats.length === 0) {
        wrongInput.wrongInput = true;
        wrongInput.message = `В поле "${timestampNode.field}" не введен исходный формат даты`;
        return wrongInput;
      }
      if (timestampNode.inputTimezone === '' || timestampNode.inputTimezone == null) {
        wrongInput.wrongInput = true;
        wrongInput.message = `В поле "${timestampNode.field}" не введна исходная временная зона`;
        return wrongInput;
      }
      if (timestampNode.outputTimezone === '' || timestampNode.outputTimezone == null) {
        wrongInput.wrongInput = true;
        wrongInput.message = `В поле "${timestampNode.field}" не введна требуемая временная зона`;
        return wrongInput;
      }
    });
    if (schema) {
      let length = schema.fields?.length || 0;
      if (schema.dynamicFields) length += schema.dynamicFields.length;
      if (length === 0) {
        wrongInput.wrongInput = true;
        wrongInput.message = 'Нельзя создать индекс с пустой схемой, добавьте нужные Вам поля.';
        return wrongInput;
      }
    }
    return wrongInput;
  };

  const transformArrayFields = useMemo(() => PipelineUtils.convertTransformArrayToTimestamp(processing?.transformArray), [processing]);

  return (
    <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
      <MaterialTable
        icons={tableIconsWithInvisibleAdd}
        style={{ width: '100%' }}
        title="Даты"
        components={{
          Toolbar: (props) => <MTableToolbar {...props} actions={props.actions.filter((a) => a.tooltip !== 'Add')} />,
        }}
        options={{
          search: true,
          paging: false,
          showTitle: false,
          actionsColumnIndex: -1,
          header: true,
          toolbarButtonAlignment: 'left',
          searchFieldAlignment: 'left',
        }}
        columns={[
          { title: 'Поле времени', field: 'field', editable: 'never', width: '10%' },
          {
            title: 'Исходный формат времени',
            field: 'inputFormats',
            editable: 'always',
            editComponent: (props) => (
              <Autocomplete
                multiple
                options={dateFormats}
                getOptionLabel={(option) => option}
                defaultValue={props.rowData.inputFormats ? props.rowData.inputFormats : []}
                onChange={(event, values) => {
                  props.onChange(values);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Исходный формат времени"
                    placeholder="Выбрать формат(ы)"
                    margin="normal"
                    fullWidth
                  />
                )}
              />
            ),
            render: (data) =>
              data.inputFormats == null || data.inputFormats.length === 0 ? (
                <Typography style={{ color: 'red' }}> Значение не введено</Typography>
              ) : (
                <Typography> {data.inputFormats.join(',')} </Typography>
              ),
          },
          {
            title: 'Исходная временная зона',
            field: 'inputTimezone',
            type: 'string',
            editComponent: (props) => (
              <Autocomplete
                options={timeZones}
                renderOption={(option) => {
                  return option;
                }}
                getOptionLabel={(option) => {
                  return option;
                }}
                defaultValue={props.rowData.inputTimezone ? props.rowData.inputTimezone : ''}
                onChange={(event, newValue) => {
                  props.onChange(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Исходная временная зона"
                    placeholder="Выберите временную зону"
                    margin="normal"
                    fullWidth
                  />
                )}
              />
            ),
            render: (data) => <Typography> {data.inputTimezone ? data.inputTimezone : ''}</Typography>,
          },
          {
            title: 'Требуемая временная зона',
            field: 'outputTimezone',
            type: 'string',
            emptyValue: 'UTC',
            editable: 'never',
          },
          {
            field: 'outputFormat',
            hidden: true,
          },
        ]}
        data={transformArrayFields}
        editable={{
          isDeletable: (rowData) => false,
          isDeleteHidden: (rowData) => true,
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve();
                if (oldData) {
                  if (newData.inputTimezone === '' || newData.inputTimezone == null) {
                    displayError('Исходная временная зона не выбрана');
                    return;
                  }
                  if (newData.inputFormats.length === 0) {
                    displayError('Исходный формат времени не выбран');
                    return;
                  }

                  const transformArray = [...processing?.transformArray] ?? ([] as TransformArrayData);

                  const parentIndex = transformArray.findIndex((array) => array.targetConfig.some((target) => target.id === newData?.id));

                  const parent = transformArray[parentIndex];
                  const index = parent.targetConfig.findIndex((target) => target.id === newData.id);

                  transformArray[parentIndex].targetConfig[index].format = newData;
                  processingChanged({ ...processing, transformArray: transformArray });
                }
              }, 300);
            }),
        }}
        localization={LOCAL_DATE}
      />
    </Grid>
  );
};
