import { useEffect, useState } from 'react';

/**
 * Хук отвечает за выполнение callback с задержкой,
 * Пример: ввод данных - для предотвращения отправки запросов на каждый введеный символ
 */
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
