import { Icon, TextField } from '@sds-eng/base';
import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react';

import * as styles from './styles.module.css';

const SEARCH_PREFIX = <Icon.Search />;
const SEARCH_DEBOUNCE_MS = 400;

export type ArchivesSearchFieldRef = {
  clear: () => void;
};

type ArchivesSearchFieldProps = {
  onDebouncedChange: (value: string) => void;
};

const ArchivesSearchField = memo(
  forwardRef<ArchivesSearchFieldRef, ArchivesSearchFieldProps>(({ onDebouncedChange }, ref) => {
    const [value, setValue] = useState('');

    useImperativeHandle(ref, () => ({
      clear: () => setValue(''),
    }));

    useEffect(() => {
      const timer = setTimeout(() => {
        onDebouncedChange(value);
      }, SEARCH_DEBOUNCE_MS);

      return () => clearTimeout(timer);
    }, [value, onDebouncedChange]);

    return (
      <TextField
        prefix={SEARCH_PREFIX}
        placeholder="Найти"
        value={value}
        onChange={setValue}
        size="md"
        className={styles.searchInput}
      />
    );
  }),
);

ArchivesSearchField.displayName = 'ArchivesSearchField';

export default ArchivesSearchField;
