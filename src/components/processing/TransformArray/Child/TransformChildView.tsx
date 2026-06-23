import MaterialTable, { Column, Icons, Localization, Options } from '@material-table/core';
import { TextField, Tooltip } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import InfoIcon from '@material-ui/icons/Info';
import * as React from 'react';

import * as transformHelpers from '../functions';
import { ITransformData, ITransformTableData } from '../types';

export interface ITransformChildView extends Omit<ITransformTableData, 'arrayNames'> {
  transformArrayData: ITransformTableData[];
  columns: Column<ITransformData>[];
  icons: Icons;
  options: Options<ITransformData>;
  localization: Localization;
  arrayNameError: string | null;
  parentIndex: number;
  arrayName: string;

  onChangeArrayName(name: string): void;

  onRowAdd({ isNew, ...rowData }: ITransformData): Promise<void>;

  onRowUpdate(newData: ITransformData, oldData: ITransformData): Promise<void>;

  onBulkUpdate(changes: { oldData: ITransformData; newData: ITransformData }[]): Promise<void>;

  onRowDelete(rowData: ITransformData): Promise<void>;

  onDeleteArray(id: number): void;
}

export const TransformChildView: React.FC<ITransformChildView> = ({
  columns,
  arrayName,
  arrayNameError,
  fields: data,
  id,
  icons,
  options,
  localization,
  onDeleteArray,
  onChangeArrayName,
  onRowAdd,
  onRowUpdate,
  onBulkUpdate,
  onRowDelete,
}: ITransformChildView) => {
  return (
    <Grid
      container
      justifyContent="flex-start"
      alignItems="flex-start"
      style={{
        width: '100%',
        marginBottom: '1rem',
        boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
        padding: '8px',
        borderRadius: '4px',
      }}
      spacing={2}
    >
      <Grid item xs={4}>
        <Box sx={{ marginTop: '85px' }}>
          <TextField
            label="Имена массивов"
            value={arrayName}
            fullWidth
            id={transformHelpers.nanoid(5)}
            error={!!arrayNameError}
            helperText={arrayNameError ? arrayNameError : undefined}
            onChange={(e) => onChangeArrayName(e.target.value)}
            InputLabelProps={{
              style: {
                fontSize: '0.875rem',
                transform: 'translate(0, 1.5px) scale(0.75)',
              },
            }}
            InputProps={{
              // renderSuffix: ({error, filled, margin,startAdornment}) => <Tooltip
              //     title={'Несколько имён массивов вводятся через запятую (без пробела)'}> <InfoIcon
              //     fontSize={"small"} color={"primary"}/></Tooltip>,
              endAdornment: (
                <Tooltip style={{ marginTop: '33px' }} title="Несколько имён массивов вводятся через запятую (c пробелом)">
                  <InfoIcon fontSize={'small'} color={'primary'} />
                </Tooltip>
              ),
            }}
            inputProps={{
              style: {
                fontSize: '0.875rem',
                marginTop: '33px',
                paddingBottom: '11px',
                borderBottom: 'none',
              },
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={8}>
        <MaterialTable<ITransformData>
          title={''}
          columns={columns}
          data={data}
          style={{ boxShadow: 'none' }}
          options={options}
          icons={icons}
          actions={[
            {
              icon: icons.Delete,
              tooltip: 'Удалить массив',
              isFreeAction: true,
              onClick: (event, data) => onDeleteArray(id),
            },
          ]}
          editable={{
            isDeletable: (rowData) => data.length > 1,

            onRowAdd: onRowAdd,
            onRowUpdate: onRowUpdate,
            onRowAddCancelled: (rowData) => null,
            onBulkUpdate: onBulkUpdate,
            onRowDelete: onRowDelete,
          }}
          localization={localization}
        />
      </Grid>
    </Grid>
  );
};
