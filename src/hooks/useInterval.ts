import { useEffect, useRef } from "react";

type SideEffectFn = () => void

function useInterval(callback: SideEffectFn, delay: number | null) {
  const savedCallback = useRef<SideEffectFn>(() => {});

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default useInterval;
