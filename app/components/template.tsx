import { type FC, useEffect, useState, useRef, useMemo } from 'react';
import { type Size, useSize } from '~/hooks';

export const Template: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);
  const { width, height } = useMemo<Size>(() => {
    return (
      size ?? {
        width: 0,
        height: 0,
      }
    );
  }, [size]);

  console.log(width,height,'121')

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // TODO:
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
