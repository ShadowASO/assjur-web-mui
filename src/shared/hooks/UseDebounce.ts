import { useCallback, useRef } from "react";

export const useDebounce = (delay = 300, runImmediatelyFirstTime = true) => {
  const isFirstCall = useRef(runImmediatelyFirstTime);
  const debouncing = useRef<ReturnType<typeof setTimeout>>(delay);

  const debounce = useCallback(
    (func: () => void) => {
      if (isFirstCall.current) {
        isFirstCall.current = false;
        func();
      } else {
        if (debouncing.current) {
          clearTimeout(debouncing.current);
        }
        debouncing.current = setTimeout(func, delay);
      }
    },
    [delay]
  );

  return { debounce };
};
