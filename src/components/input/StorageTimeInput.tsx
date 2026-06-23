import { Checkbox, ComboBox, InputNumber, LabelControl } from '@sds-eng/base';
import {
  computeTimeDisplayValue,
  convertSecondsToUnitValue,
  TimeDisplayValue,
  timeDisplayValueToSeconds,
  TimeLabels,
  TimeUnit,
  useTimeUnitOptions,
} from '@src/utils/timeUnits';
import React, { useMemo, useState } from 'react';

export interface StorageTimeInputProps {
  enabled: boolean;
  value: number | null;
  onChange: (value: number | null) => void;
  onEnabledChange: (value: boolean) => void;
}

const StorageTimeInput = ({ enabled, value, onChange, onEnabledChange }: StorageTimeInputProps) => {
  const options = useTimeUnitOptions();
  const [unit, setUnit] = useState<TimeUnit>(computeTimeDisplayValue(value).unit);
  const displayValue = useMemo(() => {
    const tempDisplayValue: TimeDisplayValue = {
      value: convertSecondsToUnitValue(value || 0, unit, 3),
      unit: unit,
      label: TimeLabels[unit],
      formatted: `${value} ${TimeLabels[unit]}`,
    };
    return tempDisplayValue;
  }, [unit, value]);
  const selectedOption = useMemo(() => options.find((option) => option.value === unit), [options, unit]);
  const isValid = useMemo(() => {
    return !enabled || (value != null && value >= 1);
  }, [enabled, value]);

  const handleValueChange = (newValue: number | null) => {
    if (newValue === null || isNaN(newValue)) {
      onChange(null);
      return;
    }
    const tempDisplayValue: TimeDisplayValue = {
      value: newValue,
      unit: unit,
      label: TimeLabels[unit],
      formatted: `${newValue} ${TimeLabels[unit]}`,
    };
    onChange(timeDisplayValueToSeconds(tempDisplayValue));
  };

  const handleUnitChange = (newUnit: TimeUnit) => {
    setUnit(newUnit);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'end',
        marginBottom: '15px',
      }}
    >
      <InputNumber
        label={displayValue.value !== 0 ? 'Максимальное время хранения' : ''}
        placeholder={displayValue.value === 0 ? 'Максимальное время хранения' : ''}
        error={!isValid}
        style={{
          flexGrow: 1,
        }}
        labelProps={{
          htmlFor: 'storage-time-input-number',
        }}
        inputProps={{
          id: 'storage-time-input-number',
        }}
        value={displayValue.value === 0 ? null : displayValue.value}
        precision={0}
        onChange={handleValueChange}
      />
      <div style={{ width: '200px' }}>
        <ComboBox
          multiple={false}
          value={selectedOption}
          options={options}
          onChange={handleUnitChange}
          style={{
            width: '100px',
            flexShrink: 0,
          }}
        />
      </div>
      <div style={{ alignItems: 'center' }}>
        <LabelControl
          name="enabled"
          size="md"
          control={<Checkbox />}
          label=""
          checked={enabled}
          onChange={() => onEnabledChange(!enabled)}
          style={{ marginTop: '6px', flexShrink: 0 }}
        />
      </div>
    </div>
  );
};

export default StorageTimeInput;
