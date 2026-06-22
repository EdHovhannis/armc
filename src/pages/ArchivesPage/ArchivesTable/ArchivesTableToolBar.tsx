import { Button, Icon, Tag, Text } from '@sds-eng/base';
import { DataGridRowData, DataGridTableInstance, ShowHideColumnsMenu } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { useState } from 'react';

import { SpeedIconRemoved } from '@src/Shared/assets/icons/SpeedIconRemoved';

import { onChangeFilterDrawerOpen } from '../FilterDrawer/model';

import { ArchivesSearchInput } from './ArchivesSearchInput';
import * as styles from './styles.module.css';

interface ArchivesTableToolBarProps<TRow extends DataGridRowData> {
  onSearchChange: (value: string) => void;
  searchValue: string;
  isLoading?: boolean;
  rowCount: number;
  showHideMenuId?: string;
  table: DataGridTableInstance<TRow>;
}

export const ArchivesTableToolBar = <TRow extends DataGridRowData>({
  onSearchChange,
  searchValue,
  isLoading,
  rowCount,
  showHideMenuId,
  table,
}: ArchivesTableToolBarProps<TRow>) => {
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const onChangeFilterDrawerOpenFn = useUnit(onChangeFilterDrawerOpen);

  const windOw = window.location.search;
  const parsedUrl = JSON.parse(new URLSearchParams(windOw).get('filters') as string);
  return (
    <div className={styles.tableToolbarWrapper}>
      {parsedUrl && (
        <div style={{ maxWidth: '800px', maxHeight: '80px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          <Tag key={'item'} aria-label={'На нажатие Backspace элемент удалаяется'} onDelete={() => {}} onClick={() => {}}>
            <Text kind="bodyS" style={{ color: '#13181B8E' }}>
              Конфигурация
            </Text>
            &nbsp;
            <Text kind="h6n">{parsedUrl.values[0]}</Text>
          </Tag>
          &nbsp; &nbsp; &nbsp;
          <Text as="span" kind="bodyS" style={{ color: '#009dff' }}>
            Сбросить все
          </Text>
        </div>
      )}
      <>
        <div className={styles.tableToolbarRow}>
          <ArchivesSearchInput value={searchValue} onChange={onSearchChange} restoreFocusKey={`${searchValue}-${Boolean(isLoading)}-${rowCount}`} />
          <div className={styles.filterIcons}>
            <Button.Icon
              icon={<Icon.ColumnThree />}
              onClick={(event) => setColumnMenuAnchor((prev: HTMLElement | null) => (prev ? null : event.currentTarget))}
              aria-label="Столбцы"
            />
            <Button.Icon
              className={styles.filterIcons}
              icon={<Icon.Filter />}
              aria-label="Фильтры"
              onClick={() => onChangeFilterDrawerOpenFn(true)}
            />
          </div>

          <Button.Icon
            className={styles.filterIcons}
            icon={<SpeedIconRemoved />}
            aria-label="Сбросить фильтры"
            // onClick={() => handleClearFilters(table)}
          />
          <Button.Icon className={styles.filterIcons} icon={<Icon.Refresh />} aria-label="Обновить" onClick={() => {}} />
        </div>
        {columnMenuAnchor && <ShowHideColumnsMenu anchorEl={columnMenuAnchor} setAnchorEl={setColumnMenuAnchor} id={showHideMenuId} table={table} />}
      </>
    </div>
  );
};
