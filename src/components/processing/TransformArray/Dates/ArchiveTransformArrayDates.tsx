import MaterialTable, { MTableToolbar } from '@material-table/core';
import { Grid, TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import { useEffect, useMemo } from 'react';

import { ARCHIVE_TYPES, ArchiveProcessing } from '../../../../store/archive/Types';
import { ProcessingPipeline } from '../../../../store/pipeline/Types';
import { ArchiveUtils } from '../../../../utils/ArchiveUtils';
import { tableIconsWithInvisibleAdd } from '../../../../utils/Utils';
import { TransformArrayData } from '../types';

export interface ITransformArrayDates {
  canEdit: boolean;
  dateFormats: string[];
  processing: ArchiveProcessing;

  processingChanged(processing: ProcessingPipeline): any;

  displayError(msg: string): void;
}

const LOCAL_DATE = {
  toolbar: {
    searchTooltip: 'Поиск',
    searchPlaceholder: 'Найти нужное поле',
  },
  body: {
    emptyDataSourceMessage: 'Полей с типом "Дата" в преобразовании массивов нет',
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

export const ArchiveTransformArrayDates: React.FC<ITransformArrayDates> = ({
  processingChanged,
  dateFormats,
  processing,
  canEdit,
  displayError,
}: ITransformArrayDates) => {
  const transformArrayFields = useMemo(
    () => ArchiveUtils.convertTransformArrayToSchema(processing?.transformArray).filter((array) => array.subType === 'DATE'),
    [processing],
  );

  return (
    <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
      {canEdit ? (
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
            { title: 'Поле времени', field: 'name', editable: 'never', width: '10%' },
            { title: 'type', field: 'type', hidden: true, editable: 'never' },
            {
              title: 'Исходный формат времени',
              field: 'format',
              editable: 'always',
              editComponent: (props) => (
                <Autocomplete
                  // disabled={!this.props.canEdit}
                  options={dateFormats}
                  getOptionLabel={(option) => option}
                  defaultValue={props.rowData.format ? props.rowData.format : ''}
                  onChange={(event, values) => {
                    props.onChange(values);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Исходный формат времени"
                      placeholder="Выбрать формат"
                      margin="normal"
                      fullWidth
                    />
                  )}
                />
              ),
              render: (data) =>
                !data.format || data?.format?.length === 0 ? (
                  <Typography style={{ color: 'red' }}> Значение не введено</Typography>
                ) : (
                  <Typography> {data.format} </Typography>
                ),
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
                    if (newData.format === '' || newData.format == null) {
                      displayError('Исходный формат времени не выбран');
                      return;
                    }

                    const transformArray = [...processing?.transformArray] ?? ([] as TransformArrayData);
                    const parentIndex = transformArray.findIndex((array) => array.targetConfig.some((target) => target.id === newData?.id));

                    const parent = transformArray[parentIndex];

                    const index = parent.targetConfig.findIndex((target) => target.id === newData.id);

                    transformArray[parentIndex].targetConfig[index].format = newData.format;
                    processingChanged({ ...processing, transformArray: transformArray });
                  }
                }, 300);
              }),
          }}
          localization={LOCAL_DATE}
        />
      ) : (
        <MaterialTable
          icons={tableIconsWithInvisibleAdd}
          style={{ width: '100%' }}
          title="Даты"
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
            { title: 'Поле времени', field: 'name', editable: 'never', width: '10%' },
            { title: 'type', field: 'type', hidden: true, editable: 'never' },
            {
              title: 'Исходный формат времени',
              field: 'format',
              editable: 'always',
              render: (data) =>
                !data.format || data.format.length === 0 ? (
                  <Typography style={{ color: 'red' }}> Значение не введено</Typography>
                ) : (
                  <Typography> {data.format} </Typography>
                ),
            },
          ]}
          data={transformArrayFields}
          localization={LOCAL_DATE}
        />
      )}
    </Grid>
  );
};
