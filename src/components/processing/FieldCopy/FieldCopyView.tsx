import MaterialTable, { Icons, Localization, Options } from '@material-table/core';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as React from 'react';
import { FC } from 'react';

import { tableIcons } from '../../../utils/Utils';

import { FieldTypes, ICopyAuditParams, ITableValidate } from './types';

interface IFieldCopyView {
  data: ICopyAuditParams[];
  copyFieldTypes: FieldTypes[];
  localization: Localization;
  tableOptions: Options<ICopyAuditParams>;
  extraFieldsVisisbe: boolean;
  onRowAdd(): Promise<void>;
  onRowUpdate(newData: ICopyAuditParams, oldData?: ICopyAuditParams): Promise<void>;
  onRowDelete(oldData: ICopyAuditParams): Promise<void>;
  onRowUpdateCancelled(): void;
  extraFieldsVisisbeHandler(): void;
  validateHandler(field: string, rowData: ICopyAuditParams): boolean | ITableValidate;
}

export const FieldCopyView: FC<IFieldCopyView> = ({
  data,
  copyFieldTypes,
  localization,
  tableOptions,
  extraFieldsVisisbe,
  onRowAdd,
  onRowUpdate,
  onRowDelete,
  onRowUpdateCancelled,
  extraFieldsVisisbeHandler,
  validateHandler,
}: IFieldCopyView) => {
  return (
    <Accordion style={{ width: '100%', margin: 6 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Копирование поля параметра аудита</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container alignItems="center" direction="column" style={{ width: '100%' }}>
          <Box style={{ width: '100%', textAlign: 'right' }}>
            <FormControlLabel
              label="Отображать дополнительные поля"
              control={<Switch color="primary" checked={extraFieldsVisisbe} onChange={extraFieldsVisisbeHandler} />}
            />
          </Box>
          <MaterialTable
            data={data}
            localization={localization}
            icons={tableIcons as Icons}
            style={{ width: '100%', margin: 6 }}
            options={tableOptions}
            columns={[
              {
                title: 'Имя массива параметров',
                field: 'auditParamsArrayFieldName',
                validate: (rowData) => validateHandler('auditParamsArrayFieldName', rowData),
              },
              {
                title: 'Имя параметра',
                field: 'auditParamName',
                validate: (rowData) => validateHandler('auditParamName', rowData),
              },
              {
                title: 'Поле с именем параметра аудита',
                field: 'fieldWithAuditParamName',
                hidden: !extraFieldsVisisbe,
                validate: (rowData) => validateHandler('fieldWithAuditParamName', rowData),
              },
              {
                title: 'Поле со значением параметра аудита',
                field: 'fieldWithAuditParamValue',
                hidden: !extraFieldsVisisbe,
                validate: (rowData) => validateHandler('fieldWithAuditParamValue', rowData),
              },
              {
                title: 'Имя итогового поля',
                field: 'resultFieldName',
                hidden: !extraFieldsVisisbe,
                validate: (rowData) => validateHandler('resultFieldName', rowData),
              },
              {
                title: 'Тип поля',
                field: 'resultFieldType',
                hidden: !extraFieldsVisisbe,
                validate: (rowData) => validateHandler('resultFieldType', rowData),
                editComponent: (props) => (
                  <Select
                    fullWidth
                    value={props.value}
                    onChange={(event) => {
                      props.onChange(event.target.value);
                    }}
                  >
                    {copyFieldTypes.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                ),
              },
            ]}
            editable={{
              onRowAdd: () => onRowAdd(),
              onRowUpdate: (newData: ICopyAuditParams, oldData?: ICopyAuditParams) => onRowUpdate(newData, oldData),
              onRowDelete: (oldData: ICopyAuditParams) => onRowDelete(oldData),
              onRowUpdateCancelled: () => onRowUpdateCancelled(),
            }}
          />
          <IconButton color="primary" className="add-row-btn" style={{ marginTop: 12, marginLeft: -16 }} onClick={() => onRowAdd()}>
            <AddIcon />
          </IconButton>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
