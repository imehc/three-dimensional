/**
 * @fileOverview Wrapper component to make charts adapt to the size of parent * DOM
 */
import clsx from "clsx";
import {
  cloneElement,
  forwardRef,
  type ReactElement,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useResizeDetector } from "react-resize-detector";

export interface Props {
  aspect?: number;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: number;
  children: ReactElement;
  debounce?: number;
  id?: string | number;
  className?: string | number;
}

export const ResponsiveContainer = forwardRef(
  (
    {
      aspect,
      width = "100%",
      height = "100%",
      minWidth,
      minHeight,
      maxHeight,
      children,
      debounce = 0,
      id,
      className,
    }: Props,
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Use the new useResizeDetector hook
    const { width: containerWidth = 0, height: containerHeight = 0 } = useResizeDetector({
      targetRef: containerRef,
      refreshMode: "debounce",
      refreshRate: debounce,
    });

    // Merge refs
    useImperativeHandle(ref, () => containerRef.current, []);

    const isPercent = useCallback(
      (value: string | number) =>
        typeof value === "string" && value.indexOf("%") === value.length - 1,
      [],
    );

    const renderChart = useMemo(() => {
      if (!containerWidth || !containerHeight) {
        return null;
      }

      let calculatedWidth: number = isPercent(width)
        ? containerWidth
        : (width as number);
      let calculatedHeight: number = isPercent(height)
        ? containerHeight
        : (height as number);

      if (aspect && aspect > 0) {
        // Preserve the desired aspect ratio
        if (calculatedWidth) {
          // Will default to using width for aspect ratio
          calculatedHeight = calculatedWidth / aspect;
        } else if (calculatedHeight) {
          // But we should also take height into consideration
          calculatedWidth = calculatedHeight * aspect;
        }

        // if maxHeight is set, overwrite if calculatedHeight is greater than maxHeight
        if (maxHeight && calculatedHeight > maxHeight) {
          calculatedHeight = maxHeight;
        }
      }

      return cloneElement(children, {
        width: calculatedWidth,
        height: calculatedHeight,
      } as { width: number; height: number });
    }, [aspect, children, containerHeight, containerWidth, height, isPercent, maxHeight, width]);

    const style = { width, height, minWidth, minHeight, maxHeight };

    return (
      <div
        {...(id != null ? { id: `${id}` } : {})}
        className={clsx("responsive-container", className)}
        style={style}
        ref={containerRef}
      >
        {renderChart}
      </div>
    );
  },
);
