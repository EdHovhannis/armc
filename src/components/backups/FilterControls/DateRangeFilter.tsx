import { DateLibAdapterProvider, RangePicker } from '@sds-eng/base';
import { MomentAdapter } from '@sds-eng/base/dist/esm/adapters/moment';
import moment from 'moment';
import React from 'react';

interface DateRangeFilterProps {
  fromValue: string | null;
  toValue: string | null;
  onChange: (values: { fromValue?: string; toValue?: string }) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ fromValue, toValue, onChange }) => {
  const handleRangeChange = ([from, to]: [Date | null | number, Date | null | number]) => {
    onChange({
      fromValue: from ? moment(from, 'YYYY-MM-DDTHH:mm:ss.SSSZ').startOf('day').format() : undefined,
      toValue: to ? moment(to, 'YYYY-MM-DDTHH:mm:ss.SSSZ').endOf('day').format() : undefined,
    });
  };

  const parsedFrom = fromValue ? moment(fromValue).toDate() : null;
  const parsedTo = toValue ? moment(toValue).toDate() : null;

  return (
    <DateLibAdapterProvider
      dateAdapter={MomentAdapter}
      options={{
        locale: 'ru',
        formats: {
          fullDate: 'DD.MM.YYYY',
          fullDateTime: 'DD.MM.YYYY HH:mm',
        },
      }}
    >
      <RangePicker
        disableFuture
        value={[parsedFrom, parsedTo]}
        format="DD.MM.YYYY"
        mask="11.11.1111"
        style={{ marginTop: -4, minWidth: '350px' }}
        startInputProps={{
          placeholder: 'дата начала',
        }}
        endInputProps={{
          placeholder: 'дата окончания',
        }}
        fullWidth
        onChange={handleRangeChange}
      />
    </DateLibAdapterProvider>
  );
};

export default DateRangeFilter;
