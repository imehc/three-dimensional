import clsx from "clsx";
import { forwardRef, type PropsWithChildren } from "react";

interface Props {
	className?: string;
}

export default forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
	({ children, className }, ref) => {
		return (
			<div
				ref={ref}
				className={clsx(
					"tw:w-full tw:md:w-2xl tw:aspect-video tw:border tw:border-base-300 tw:box-border tw:relative",
					className,
				)}
			>
				{children}
			</div>
		);
	},
);
