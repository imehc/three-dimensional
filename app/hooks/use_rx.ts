import { useCallback, useEffect, useMemo, useRef } from "react";
import { BehaviorSubject, ReplaySubject, Subject } from "rxjs";

export const useSubject = <T = unknown>(): [Subject<T>, (val: T) => void] => {
  const subject = useMemo(() => new Subject<T>(), []);
  const handler = useCallback(
    (val: T) => {
      subject.next(val);
    },
    [subject]
  );
  return [subject, handler];
};

export const useBehaviorSubject = <T = unknown>(
  init: T
): [BehaviorSubject<T>, (val: T) => void] => {
  const initRef = useRef(init);
  const subject = useMemo(() => new BehaviorSubject<T>(initRef.current), []);
  const handler = useCallback(
    (val: T) => {
      subject.next(val);
    },
    [subject]
  );
  return [subject, handler];
};

export const useReplaySubject = <T = unknown>(
  bufferSize?: number
): [ReplaySubject<T>, (val: T) => void] => {
  const subject = useMemo(() => new ReplaySubject<T>(bufferSize), [bufferSize]);
  const handler = useCallback(
    (val: T) => {
      subject.next(val);
    },
    [subject]
  );
  return useMemo(() => [subject, handler], [handler, subject]);
};

export const useReplayStream = <T = unknown>(val: T, bufferSize?: number) => {
  const [stream, next] = useReplaySubject<T>(bufferSize);
  useEffect(() => {
    next(val);
  }, [next, val]);
  return stream;
};