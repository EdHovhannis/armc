import { List, ListItem, OptionListProps, SelectNextProps, Text } from '@sds-eng/base';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ElementType, useRef } from 'react';

import { OptionItemType } from '@src/Shared/types/filter';

const VirtualizedList = (props: OptionListProps<OptionItemType, ElementType<HTMLUListElement>, ElementType<HTMLLIElement>>) => {
  const { listProps, filteredOptions, onSelectOption } = props;

  const parentRef = useRef<HTMLUListElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 10,
  });

  const items = rowVirtualizer.getVirtualItems();

  return (
    <List
      as="ul"
      role="list"
      ref={parentRef}
      interactive={false}
      className={listProps.className}
      style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative', maxHeight: '300px' }}
    >
      {items.map((virtualRow) => {
        const item = filteredOptions[virtualRow.index];
        if (item) {
          const { label, ...rest } = item;
          return (
            <ListItem
              key={virtualRow.key}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                cursor: 'pointer',
              }}
              onClick={(e) => onSelectOption({ label, ...rest }, e)}
            >
              <Text ellipsis={{ tooltip: true }}>{label}</Text>
            </ListItem>
          );
        }
        return null;
      })}
    </List>
  );
};

export const components = { OptionList: VirtualizedList } as SelectNextProps<
  OptionItemType | null,
  ElementType<HTMLUListElement>,
  ElementType<HTMLLIElement>
>['components'];
