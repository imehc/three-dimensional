import { useRef } from "react";

export const useLatest = <T,>(init: T) => {
  const ref = useRef(init);
  ref.current = init;
  return ref;
};
