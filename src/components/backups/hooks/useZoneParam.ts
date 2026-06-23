import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

export const useZoneParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const zone = useMemo(() => {
    return searchParams.get('zone') || '';
  }, [searchParams]);

  const setZone = useCallback(
    (newZone: string, options?: { replace?: boolean }) => {
      const { replace = true } = options || {};
      const nextParams = new URLSearchParams(searchParams);
      if (newZone) {
        nextParams.set('zone', newZone);
      } else {
        nextParams.delete('zone');
      }
      setSearchParams(nextParams, { replace });
    },
    [searchParams, setSearchParams],
  );

  return { zone, setZone };
};
