// https://overreacted.io/making-settimeout-declarative-with-react-hooks/
import { useEffect, useRef } from "react";

type SideEffectFn = () => void;

export const useTimeout = (callback: SideEffectFn, delay: number | null) => {
  const savedCallback = useRef<SideEffectFn>(() => {});

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout.
  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };
    if (delay !== null) {
      let id = setTimeout(tick, delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
};
