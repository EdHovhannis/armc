import { Icon, TextField } from '@sds-eng/base';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import * as styles from './styles.module.css';

interface ArchivesSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  restoreFocusKey: string;
}
const SEARCH_DEBOUNCE_MS = 400;
const SEARCH_ICON = <Icon.Search />;

export const ArchivesSearchInput = memo(({ value, onChange, restoreFocusKey }: ArchivesSearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const shouldRestoreFocusRef = useRef(false);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        shouldRestoreFocusRef.current = false;
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (localValue === value) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onChange(localValue);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [localValue, onChange, value]);

  useEffect(() => {
    if (!shouldRestoreFocusRef.current) {
      return;
    }

    const input = wrapperRef.current?.querySelector('input');
    if (!input || document.activeElement === input) {
      return;
    }

    input.focus();
  }, [restoreFocusKey]);

  const handleChange = useCallback((nextValue: string) => {
    shouldRestoreFocusRef.current = true;
    setLocalValue(nextValue);
  }, []);

  return (
    <div ref={wrapperRef}>
      <TextField prefix={SEARCH_ICON} placeholder="Найти" value={localValue} onChange={handleChange} size="md" className={styles.searchInput} />
    </div>
  );
});

ArchivesSearchInput.displayName = 'ArchivesSearchInput';
