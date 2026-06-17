import { List, OptionListProps, SelectNextProps } from '@sds-eng/base';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CSSProperties, ElementType, useRef } from 'react';

import { OptionItemType } from '@src/Shared/types/filter';

const VirtualizedList = (props: OptionListProps<OptionItemType, ElementType<HTMLUListElement>, ElementType<HTMLLIElement>>) => {
  const { listProps, filteredOptions, OptionItemComponent, commonOptionItemProps } = props;

  const parentRef = useRef<HTMLUListElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 10,
  });

  return (
    <List
      as="ul"
      role="list"
      ref={parentRef}
      interactive={false}
      className={listProps.className}
      style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative', maxHeight: '300px' }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const item = filteredOptions[virtualRow.index];
        if (!item) {
          return null;
        }

        // рендерим строку штатным OptionItem - он даёт чекбокс/выбранное состояние для multiple.
        // позиционирование виртуализации задаём через style самой строки
        const rowStyle: CSSProperties = {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        };

        return (
          <OptionItemComponent
            key={virtualRow.key}
            {...props}
            option={item}
            // в типах библиотеки style - DOM CSSStyleDeclaration, в рантайме React ждёт обычный CSSProperties
            commonOptionItemProps={{ ...commonOptionItemProps, 'data-index': virtualRow.index, style: rowStyle as unknown as CSSStyleDeclaration }}
          />
        );
      })}
    </List>
  );
};

export const components = { OptionList: VirtualizedList } as SelectNextProps<
  OptionItemType | null,
  ElementType<HTMLUListElement>,
  ElementType<HTMLLIElement>
>['components'];
