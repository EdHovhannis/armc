import { ComboBox, InputNumber } from '@sds-eng/base';
import {
  computeSpeedDisplayValue,
  convertBytesPerSecToUnitValue,
  SpeedDisplayValue,
  speedDisplayValueToBytesPerSec,
  SpeedLabels,
  SpeedUnit,
  useSpeedUnitOptions,
} from '@src/utils/speedUnits';
import React, { useMemo, useState } from 'react';

export interface DataRateInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const DataRateInput = ({ value, onChange }: DataRateInputProps) => {
  const options = useSpeedUnitOptions();
  const [unit, setUnit] = useState<SpeedUnit>(computeSpeedDisplayValue(value).unit);
  const displayValue = useMemo(() => {
    const tempDisplayValue: SpeedDisplayValue = {
      value: convertBytesPerSecToUnitValue(value || 0, unit, 3),
      unit: unit,
      label: SpeedLabels[unit],
      formatted: `${value} ${SpeedLabels[unit]}`,
    };
    return tempDisplayValue;
  }, [unit, value]);
  const selectedOption = useMemo(() => options.find((option) => option.value === unit), [options, unit]);

  const isValid = useMemo(() => {
    return value != null && value >= 1;
  }, [value]);

  const handleValueChange = (newValue: number | null) => {
    if (newValue === null || isNaN(newValue)) {
      onChange(null);
      return;
    }
    const tempDisplayValue: SpeedDisplayValue = {
      value: newValue,
      unit: unit,
      label: SpeedLabels[unit],
      formatted: `${newValue} ${SpeedLabels[unit]}`,
    };
    onChange(speedDisplayValueToBytesPerSec(tempDisplayValue));
  };

  const handleUnitChange = (newUnit: SpeedUnit) => {
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
        label={displayValue.value !== 0 ? 'Максимальная скорость записи' : ''}
        placeholder={displayValue.value === 0 ? 'Максимальная скорость записи' : ''}
        required
        error={!isValid}
        style={{
          flexGrow: 1,
        }}
        labelProps={{
          htmlFor: 'max-data-rate-input-number',
        }}
        inputProps={{
          id: 'max-data-rate-input-number',
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
    </div>
  );
};

export default DataRateInput;
