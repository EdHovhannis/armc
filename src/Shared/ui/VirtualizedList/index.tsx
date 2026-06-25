import { List, OptionListProps, SelectNextProps } from '@sds-eng/base';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CSSProperties, ElementType, useState } from 'react';

import { OptionItemType } from '@src/Shared/types/filter';

const VirtualizedList = (props: OptionListProps<OptionItemType, ElementType<HTMLUListElement>, ElementType<HTMLLIElement>>) => {
  const { listProps, filteredOptions, OptionItemComponent, commonOptionItemProps } = props;

  // храним scroll-элемент в state, а не в ref: присвоение ref.current не вызывает ре-рендер,
  // поэтому при открытии дропдауна (или когда опции приходят асинхронно) виртуализатор успевал
  // прочитать getScrollElement() === null и отрисовать пустой список. Через state монтирование
  // элемента триггерит ре-рендер, и виртуализатор корректно пересчитывает видимые строки.
  const [scrollElement, setScrollElement] = useState<HTMLUListElement | null>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 32,
    overscan: 10,
  });

  return (
    <List
      as="ul"
      role="list"
      ref={setScrollElement}
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
