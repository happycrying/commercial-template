import { useInsertionEffect, useRef } from "react";

export function useLatest<T>(value: T) {
  const valueRef = useRef<T>(null);
  useInsertionEffect(() => {
    valueRef.current = value;
  }, []);
  return valueRef;
}
