import { FC, useCallback, useRef, useState } from 'react';

import { ArchivesSearchFieldRef } from './ArchivesSearchField';
import ArchivesTableGrid, { ArchivesTableGridHandle } from './ArchivesTableGrid';
import ArchivesTableToolbar from './ArchivesTableToolbar';

const ArchivesTable: FC = () => {
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchFieldRef = useRef<ArchivesSearchFieldRef>(null);
  const gridRef = useRef<ArchivesTableGridHandle>(null);

  const handleDebouncedSearchChange = useCallback((value: string) => {
    setDebouncedSearchQuery(value);
  }, []);

  const handleColumnMenuClick = useCallback((anchor: HTMLElement) => {
    gridRef.current?.toggleColumnMenu(anchor);
  }, []);

  const handleFiltersClick = useCallback(() => {
    gridRef.current?.openFilters();
  }, []);

  const handleRefresh = useCallback(() => {
    gridRef.current?.refresh();
  }, []);

  const handleClearFilters = useCallback(() => {
    searchFieldRef.current?.clear();
    setDebouncedSearchQuery('');
    gridRef.current?.resetPagination();
  }, []);

  return (
    <>
      <ArchivesTableToolbar
        searchFieldRef={searchFieldRef}
        onDebouncedSearchChange={handleDebouncedSearchChange}
        onColumnMenuClick={handleColumnMenuClick}
        onFiltersClick={handleFiltersClick}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
      />
      <ArchivesTableGrid ref={gridRef} debouncedSearchQuery={debouncedSearchQuery} />
    </>
  );
};

export default ArchivesTable;
