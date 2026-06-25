import { List, OptionListProps, SelectNextProps } from '@sds-eng/base';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CSSProperties, ElementType, useLayoutEffect, useState } from 'react';

import { OptionItemType } from '@src/Shared/types/filter';

// Виртуализатор (@tanstack/react-virtual) обновляет видимые строки асинхронно через ResizeObserver
// и помечен как несовместимый с ре-рендерами React. На коротких списках это даёт баг "опции иногда
// не видны, а с console.log/после ещё одного рендера всё появляется". Поэтому короткие списки
// (а это почти все наши селекты - проекты, статусы, фильтры) рендерим напрямую, без виртуализации,
// и оставляем виртуализатор только для действительно длинных списков (метки/имена на тысячи строк).
const VIRTUALIZATION_THRESHOLD = 60;
const OPTION_ROW_HEIGHT = 32;

type VirtualizedListPropsType = OptionListProps<OptionItemType, ElementType<HTMLUListElement>, ElementType<HTMLLIElement>>;

const VirtualizedRows = (props: VirtualizedListPropsType) => {
  const { listProps, filteredOptions, OptionItemComponent, commonOptionItemProps } = props;

  // scroll-элемент держим в state (а не ref): присвоение ref.current не вызывает ре-рендер,
  // из-за чего виртуализатор читал getScrollElement() === null и рисовал пустой список.
  const [scrollElement, setScrollElement] = useState<HTMLUListElement | null>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => OPTION_ROW_HEIGHT,
    overscan: 10,
  });

  // форсируем синхронный пересчёт после монтирования scroll-элемента и при изменении набора опций,
  // чтобы не зависеть от асинхронного ResizeObserver на первом открытии дропдауна.
  useLayoutEffect(() => {
    if (scrollElement) {
      rowVirtualizer.measure();
    }
  }, [scrollElement, filteredOptions.length, rowVirtualizer]);

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
            commonOptionItemProps={{ ...commonOptionItemProps, 'data-index': virtualRow.index, style: rowStyle as unknown as CSSStyleDeclaration }}
          />
        );
      })}
    </List>
  );
};

const PlainRows = (props: VirtualizedListPropsType) => {
  const { listProps, filteredOptions, OptionItemComponent } = props;

  return (
    <List as="ul" role="list" interactive={false} className={listProps.className} style={{ maxHeight: '300px' }}>
      {filteredOptions.map((item, index) => (
        <OptionItemComponent key={item.value ?? index} {...props} option={item} />
      ))}
    </List>
  );
};

const VirtualizedList = (props: VirtualizedListPropsType) => {
  if (props.filteredOptions.length > VIRTUALIZATION_THRESHOLD) {
    return <VirtualizedRows {...props} />;
  }

  return <PlainRows {...props} />;
};

export const components = { OptionList: VirtualizedList } as SelectNextProps<
  OptionItemType | null,
  ElementType<HTMLUListElement>,
  ElementType<HTMLLIElement>
>['components'];
