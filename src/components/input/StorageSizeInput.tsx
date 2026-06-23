import { Checkbox, ComboBox, InputNumber, LabelControl } from '@sds-eng/base';
import {
  computeSizeDisplayValue,
  convertBytesToUnitValue,
  SizeDisplayValue,
  sizeDisplayValueToBytes,
  SizeLabels,
  SizeUnit,
  useSizeUnitOptions,
} from '@src/utils/sizeUnits';
import React, { useMemo, useState } from 'react';

export interface StorageSizeInputProps {
  enabled: boolean;
  value: number | null;
  onChange: (value: number | null) => void;
  onEnabledChange: (value: boolean) => void;
}

const StorageSizeInput = ({ enabled, value, onChange, onEnabledChange }: StorageSizeInputProps) => {
  const options = useSizeUnitOptions();
  const [unit, setUnit] = useState<SizeUnit>(computeSizeDisplayValue(value).unit);
  const displayValue = useMemo(() => {
    const tempDisplayValue: SizeDisplayValue = {
      value: convertBytesToUnitValue(value || 0, unit, 3),
      unit: unit,
      label: SizeLabels[unit],
      formatted: `${value} ${SizeLabels[unit]}`,
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
    const tempDisplayValue: SizeDisplayValue = {
      value: newValue,
      unit: unit,
      label: SizeLabels[unit],
      formatted: `${value} ${SizeLabels[unit]}`,
    };
    onChange(sizeDisplayValueToBytes(tempDisplayValue));
  };

  const handleUnitChange = (newUnit: SizeUnit) => {
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
        label={displayValue.value !== 0 ? 'Максимальный объем хранилища' : ''}
        placeholder={displayValue.value === 0 ? 'Максимальный объем хранилища' : ''}
        error={!isValid}
        style={{
          flexGrow: 1,
        }}
        labelProps={{
          htmlFor: 'storage-size-input-number',
        }}
        inputProps={{
          id: 'storage-size-input-number',
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

export default StorageSizeInput;
