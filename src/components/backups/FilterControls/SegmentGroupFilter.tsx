import { Segment, SegmentGroup } from '@sds-eng/base';
import { FilterDefinition, FilterValue } from '@src/components/backups/types';
import React from 'react';

interface ISegmentGroupFilter {
  mode: 'sidebar' | 'grid';
  definition: FilterDefinition;
  value: FilterValue | null;
  onChange: (value: FilterValue | null) => void;
}

const SegmentGroupFilter = ({ mode, definition, value, onChange }: ISegmentGroupFilter) => {
  const selectedValue = value?.value ?? '';

  const handleSegmentChange = (newValue: string) => {
    if (newValue === 'all') {
      onChange(null);
      return;
    }

    const option = definition.options?.find((opt) => opt.value === newValue);
    if (option) {
      onChange(option);
    }
  };

  return (
    <SegmentGroup
      size={'md'}
      value={selectedValue || 'all'}
      onChange={handleSegmentChange}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: mode === 'grid' ? 'column' : 'row',
      }}
    >
      <Segment
        key="all"
        value="all"
        style={{
          flex: 1,
          textAlign: 'center',
        }}
      >
        Все
      </Segment>
      {definition.options?.map((option) => (
        <Segment
          key={option.value}
          value={option.value}
          style={{
            flex: 1,
            textAlign: 'center',
          }}
        >
          {option.label}
        </Segment>
      ))}
    </SegmentGroup>
  );
};

export default SegmentGroupFilter;
