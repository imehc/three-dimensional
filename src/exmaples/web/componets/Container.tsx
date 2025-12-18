import { forwardRef, PropsWithChildren } from "react";
import clsx from "clsx";


interface Props {
	className?: string;
}

export default forwardRef<HTMLDivElement, PropsWithChildren<Props>>(({
	children,
	className
}, ref) => {
	return (
		<div
			ref={ref}
			className={clsx('w-full sm:w-md aspect-video border border-base-300 box-border relative', className)}
		>
			{children}
		</div>
	);
});