import { Select } from '@sds-eng/base';
import React, { useMemo } from 'react';

interface Option {
  value: string;
  label: string;
}

interface IZoneSelector {
  label: string;
  selectedZone: string | null;
  zones: string[];
  onSelectedZoneChanged: (zone: string | null) => void;
}

export const ZoneSelector: React.FC<IZoneSelector> = ({ label, selectedZone, zones, onSelectedZoneChanged }) => {
  const options = useMemo<Option[]>(() => zones.map((v) => ({ value: v, label: v })), [zones]);

  const selectedOption = useMemo(() => options.find((opt) => opt.value === selectedZone) || null, [options, selectedZone]);

  return (
    <Select
      placeholder={label}
      value={selectedOption}
      options={options}
      required
      multiple={false}
      disabled={false}
      style={{ width: '100%' }}
      onChange={(v: string | string[] | undefined) => {
        onSelectedZoneChanged(Array.isArray(v) ? (v[0] ?? null) : (v ?? null));
      }}
    />
  );
};
