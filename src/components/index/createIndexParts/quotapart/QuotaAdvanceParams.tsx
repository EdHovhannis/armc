import { FormControlLabel, Grid, Switch, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import { AdvancedPipeline } from '@src/store/pipeline/Types';
import { FC, useState } from 'react';

export interface QuotaAdvanceParamsProps {
  onAdvancedChange: (advanced: AdvancedPipeline) => void;
  toggleChangeIsAdvance: (toggle: boolean) => void;
  advanced: AdvancedPipeline;
  isAdvancedFields?: boolean;
  errorCodes: string[];
}

type AdvancedField = keyof AdvancedPipeline;

type ValidateFunction = (value: number) => boolean;

const hasAdvancedValues = (advanced: AdvancedPipeline): boolean => {
  return Object.values(advanced).some((value) => value !== null && value !== undefined);
};
const AdvancedItemsErrorCodes = {
  MAX_SHARD_SIZE_EXCEEDS_NOMINAL: 'Заданный максимальный размер шарда превышает номинальный более чем в 20 раз',
  MAX_SHARD_SIZE_LESS_NOMINAL: 'Заданный максимальный размер шарда меньше номинального более чем в 20 раз',
  TOO_BIG_SHARD_SIZE: 'Количество шардов превышает количество узлов Solr более чем в 2.5 раза',
  WRITE_AND_READ_PARALLELISM_SPEC_TOGETHER: 'Параметры параллелизм записи и параллелизм вычитки должны быть заданы совместно либо не заданы вообще',
  SOURCE_PARALLELISM_GREAT_THEN_SINK_PARALLELISM: 'Параметр параллелизм записи должен быть больше или равен параметру параллелизм вычитки',
};

const advancedFieldsConfig: Array<{
  label: string;
  tooltip: string;
  validateFunction: ValidateFunction;
  field: AdvancedField;
  helperTextCode?: string[];
}> = [
  {
    label: 'Максимальный размер шарда в байтах',
    tooltip: 'Максимальный размер шарда должен быть более 1048576 и не отличаться от номинального более чем в 20 раз',
    validateFunction: (value: number) => value > 1048576,
    field: 'maxShardSizeBytes',
    helperTextCode: ['MAX_SHARD_SIZE_EXCEEDS_NOMINAL', 'MAX_SHARD_SIZE_LESS_NOMINAL'],
  },
  {
    label: 'Количество потоков sink',
    tooltip: 'Количество потоков sink может быть от 1 до 15',
    validateFunction: (value: number) => value >= 1 && value <= 15,
    field: 'sinkNumThreads',
  },
  {
    label: 'Размер пачки записи документов',
    tooltip: 'Размер пачки записи документов может быть от 500 до 20000',
    validateFunction: (value: number) => value >= 500 && value <= 20000,
    field: 'sinkBatchSize',
  },
  {
    label: 'Количество шардов',
    tooltip: 'Количество шардов может быть не более чем в 2,5 раза больше чем число узлов solr',
    validateFunction: (value: number) => value >= 1,
    field: 'collectionShards',
    helperTextCode: ['TOO_BIG_SHARD_SIZE'],
  },
  {
    label: 'Параллелизм вычитки',
    tooltip: 'Параметр параллелизм записи должен быть больше или равен параметру параллелизм вычитки.',
    validateFunction: (value: number) => value >= 1,
    field: 'sourcesParallelism',
    helperTextCode: ['WRITE_AND_READ_PARALLELISM_SPEC_TOGETHER'],
  },
  {
    label: 'Параллелизм записи',
    tooltip: 'Параметр параллелизм записи должен быть больше или равен параметру параллелизм вычитки.',
    validateFunction: (value: number) => value >= 1,
    field: 'nodesAndSinkParallelism',
    helperTextCode: ['WRITE_AND_READ_PARALLELISM_SPEC_TOGETHER', 'SOURCE_PARALLELISM_GREAT_THEN_SINK_PARALLELISM'],
  },
];

export const QuotaAdvanceParams: FC<QuotaAdvanceParamsProps> = ({
  onAdvancedChange,
  toggleChangeIsAdvance,
  advanced,
  isAdvancedFields,
  errorCodes,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const validNumberOrNull = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue === '' ? null : Number(numericValue);
  };

  const isValueValid = (value: number | null | undefined, validationFunction: ValidateFunction) => {
    return value === undefined || value === null || validationFunction(value);
  };

  const handleChange = <K extends AdvancedField>(field: K, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = validNumberOrNull(e.target.value);
    const updatedAdvanced = { ...advanced, [field]: newValue };
    onAdvancedChange(updatedAdvanced);
  };

  const handleSwitchChange = (checked: boolean) => {
    if (!checked && hasAdvancedValues(advanced)) {
      setShowConfirmDialog(true);
    } else {
      toggleChangeIsAdvance(checked);
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    onAdvancedChange({
      maxShardSizeBytes: null,
      sinkNumThreads: null,
      sinkBatchSize: null,
      collectionShards: null,
      sourcesParallelism: null,
      nodesAndSinkParallelism: null,
    });
    toggleChangeIsAdvance(false);
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Grid style={{ marginTop: 6 }}>
        <FormControlLabel
          control={<Switch checked={isAdvancedFields} onChange={(e) => handleSwitchChange(e.target.checked)} color="primary" />}
          label="Задать расширенные параметры"
        />
      </Grid>

      {isAdvancedFields && (
        <Grid container direction="column" style={{ marginTop: 10, marginBottom: 20 }}>
          {advancedFieldsConfig.map(({ label, tooltip, validateFunction, field, helperTextCode }) => {
            const isHelperText = helperTextCode?.find((item) => item === errorCodes[0]);
            return (
              <Grid item key={field}>
                <Tooltip title={tooltip}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={label}
                    value={advanced[field] ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(field, e)}
                    type="text"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    error={!isValueValid(advanced[field], validateFunction) || Boolean(isHelperText)}
                    helperText={isHelperText ? AdvancedItemsErrorCodes[isHelperText] : null}
                    style={{ marginTop: 10 }}
                  />
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Диалог подтверждения */}
      <Dialog open={showConfirmDialog} onClose={handleCancelClose}>
        <DialogTitle>Подтвердите действие</DialogTitle>
        <DialogContent>При отключении расширенных параметров все заданные значения будут сброшены. Продолжить?</DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmClose} color="primary" autoFocus>
            Да, сбросить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
