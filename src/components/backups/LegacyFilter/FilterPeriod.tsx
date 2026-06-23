import { DateLibAdapterProvider, RangePicker, IconBase } from '@sds-eng/base';
import { MomentAdapter } from '@sds-eng/base/dist/esm/adapters/moment';
import { Clear } from '@sds-eng/base/dist/esm/icons';
import * as moment from 'moment';
import * as React from 'react';

export interface IPeriodValue {
  from: string | null;
  to: string | null;
}

interface IFilterPeriod {
  value: IPeriodValue;
  onChange: (value: IPeriodValue) => void;
}

export const FilterPeriod: React.FC<IFilterPeriod> = ({ value, onChange }: IFilterPeriod) => {
  const handleRangeChange = ([from, to]: [Date | null, Date | null]) => {
    onChange({
      from: from ? moment(from).format('YYYY-MM-DDT00:00:00.000Z') : null,
      to: to ? moment(to).format('YYYY-MM-DDT23:59:59.999Z') : null,
    });
  };

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
        value={[value.from ? moment(value.from).toDate() : null, value.to ? moment(value.to).toDate() : null]}
        format="DD.MM.YYYY"
        mask="11.11.1111"
        label="Период"
        style={{ marginTop: -4 }}
        suffix={
          <IconBase onClick={() => onChange({ from: null, to: null })} style={{ cursor: 'pointer', marginRight: 0 }}>
            <Clear color="foreAccent" />
          </IconBase>
        }
        onChange={handleRangeChange}
      />
    </DateLibAdapterProvider>
  );
};
