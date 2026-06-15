import { Button, createUseStyles, Icon } from '@sds-eng/base';
import {
  DataGrid,
  DataGridColumnDef,
  DataGridRowData,
  DataGridSortingState,
  DataGridRowSelectionState,
  DataGridProps,
  DataGridVisibilityState,
  DataGridColumnSizingState,
  ShowHideColumnsMenu,
  DataGridTableInstance,
} from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { useEffect, UIEvent, JSX, useRef, useState, MouseEvent, useCallback } from 'react';

import { $activeTableRow } from '@src/Entities/ActiveRow/model';

interface DataGridTableProps<T extends DataGridRowData> extends Omit<DataGridProps<T>, 'data' | 'columns' | 'isLoading' | 'table'> {
  data: T[];
  columns: DataGridColumnDef<T, unknown>[];
  isLoading: boolean;
  sorting?: DataGridSortingState;
  rowSelection?: DataGridRowSelectionState;
  columnVisibility?: DataGridVisibilityState;
  columnSizing?: DataGridColumnSizingState;
  additionalHeight?: number;
  onRowClick?: (rowIndex: number) => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
}

interface CustomShowHideMenuProps<T extends DataGridRowData> {
  table: DataGridTableInstance<T>;
}

const CustomShowHideMenu = <T extends DataGridRowData>({ table }: CustomShowHideMenuProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  }, []);

  return (
    <>
      <Button.Icon icon={<Icon.ColumnThree />} onClick={handleClick} />
      {anchorEl && <ShowHideColumnsMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} table={table} id="show-hide-menu" />}
    </>
  );
};

const DataGridTable = <T extends DataGridRowData>(props: DataGridTableProps<T>): JSX.Element => {
  const styles = useStyles();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  const {
    data,
    columns,
    isLoading,
    sorting = [],
    rowSelection = {},
    columnVisibility = {},
    columnSizing = {},
    onSortingChange,
    onRowClick,
    onRowSelectionChange,
    onScroll,
    manualSorting = true,
    additionalHeight,
    ...rest
  } = props;
  const [activeMetamodelRow] = useUnit([$activeTableRow]);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return;
    }

    const ro = new ResizeObserver(() => {
      let currentHeight = wrapper.offsetHeight;
      if (typeof additionalHeight === 'number') {
        // Если есть доп высота, отнимаем ее
        currentHeight = currentHeight - additionalHeight;
      }
      setHeight(currentHeight);
    });

    ro.observe(wrapper);

    return () => {
      if (wrapper) {
        ro.unobserve(wrapper);
      }
    };
  }, [additionalHeight]);

  useEffect(() => {
    if (typeof activeMetamodelRow === 'number') {
      const element = document.querySelector(`tr[data-index='${activeMetamodelRow}']`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeMetamodelRow]);

  return (
    <div className={styles.dataGridTableWrapper} ref={wrapperRef}>
      <DataGrid
        data={data}
        columns={columns}
        layoutMode="grid"
        state={{
          isLoading,
          sorting,
          rowSelection,
          columnVisibility,
          columnSizing,
        }}
        onSortingChange={onSortingChange}
        onRowSelectionChange={onRowSelectionChange}
        manualSorting={manualSorting}
        enableStickyHeader
        enableRowVirtualization
        enableBottomToolbar={false}
        enablePagination={false}
        enableTopToolbar={false}
        enableColumnActions={false}
        tableHeadCellProps={{ className: styles.headerWrapperMetamodels }}
        displayColumnDefOptions={{
          'data-grid-row-select': { header: '', size: 40, maxSize: 40, minSize: 40 },
        }}
        renderToolbarInternalActions={({ table }) => <CustomShowHideMenu table={table} />}
        tableContainerProps={{ style: { height, maxHeight: 'none' }, onScroll }}
        tableBodyRowProps={({ row }) => ({
          className: styles.tableBodyTextColor,
          onClick: onRowClick ? () => onRowClick(row.index) : undefined,
          style: {
            backgroundColor:
              typeof activeMetamodelRow === 'number' && row.index === activeMetamodelRow
                ? 'var(--sds-eng-Background-surfaceSecondaryHover, #2a72f81f)'
                : undefined,
          },
        })}
        {...rest}
      />
    </div>
  );
};

export default DataGridTable;

const useStyles = createUseStyles({
  dataGridTableWrapper: {
    height: '100%',
    '& *': {
      boxSizing: 'content-box',
    },
  },
  headerWrapperMetamodels: {
    '& div': {
      alignItems: 'flex-start',
    },
  },
  tableBodyTextColor: {
    color: 'var(--sds-eng-Foreground-forePrimary, #060a0cf5)',
  },
  '@global': {
    '#show-hide-menu > ul': {
      maxHeight: 400,
      overflow: 'auto',
    },
  },
});
