import ErrorBoundary from "@docusaurus/ErrorBoundary";
import clsx from "clsx";
import { forwardRef, type PropsWithChildren } from "react";

interface Props {
	className?: string;
	hiddenBorder?: boolean;
	autoHeight?: boolean;
	fullWidth?: boolean;
}

export default forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
	({ children, className, hiddenBorder = false, autoHeight = false, fullWidth = false }, ref) => {
		return (
			<div
				ref={ref}
				className={clsx(
					"tw:w-full tw:relative",
					{ 'tw:border tw:border-base-300 tw:box-border': !hiddenBorder },
					{ 'tw:aspect-video': !autoHeight },
					[fullWidth ? 'tw:w-full' : 'tw:md:w-2xl'],
					className,
				)}
			>
				<ErrorBoundary fallback={() => <div>Something went wrong</div>}>
					{children}
				</ErrorBoundary>
			</div>
		);
	},
);
