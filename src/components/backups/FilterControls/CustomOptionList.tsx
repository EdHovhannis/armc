import { defaultComboboxComponents, Divider, Link } from '@sds-eng/base';
import React from 'react';

export type CustomOptionListProps = Parameters<typeof defaultComboboxComponents.OptionList>[0];

export const CustomOptionList: React.FC<CustomOptionListProps & { onSelectAll: () => void; buttonEnabled: boolean }> = ({
  onSelectAll,
  buttonEnabled,
  ...optionListProps
}) => {
  const OptionListComponent = defaultComboboxComponents.OptionList;

  return (
    <>
      <div
        style={{
          background: 'white',
          padding: '6px',
        }}
      >
        <Link onClick={onSelectAll} disabled={!buttonEnabled}>
          Выбрать все
        </Link>
      </div>
      <Divider />
      <OptionListComponent {...optionListProps} />
    </>
  );
};
