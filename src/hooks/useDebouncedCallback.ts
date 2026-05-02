import { useCallback, useEffect, useRef } from 'react';

export function useDebouncedCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number
): {
  call: (...args: TArgs) => void;
  flush: () => void;
  cancel: () => void;
} {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  const lastArgsRef = useRef<TArgs | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (lastArgsRef.current) {
      const args = lastArgsRef.current;
      lastArgsRef.current = null;
      fnRef.current(...args);
    }
  }, []);

  const call = useCallback(
    (...args: TArgs) => {
      lastArgsRef.current = args;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        if (lastArgsRef.current) {
          const a = lastArgsRef.current;
          lastArgsRef.current = null;
          fnRef.current(...a);
        }
      }, delay);
    },
    [delay]
  );

  useEffect(() => () => cancel(), [cancel]);

  return { call, flush, cancel };
}
