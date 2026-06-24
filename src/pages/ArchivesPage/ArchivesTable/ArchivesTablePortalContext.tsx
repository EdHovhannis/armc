import { createContext, useContext } from 'react';

export const ArchivesTablePortalContext = createContext<HTMLElement | null>(null);

export const useArchivesTablePortalContainer = () => useContext(ArchivesTablePortalContext);

export const COLUMN_FILTER_POPOVER_Z_INDEX = 1300;
