import type { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useLocation } from "react-router";

export const RouteAwareErrorBoundary = ({ children }: PropsWithChildren) => {
	const location = useLocation();

	return (
		<ErrorBoundary
			FallbackComponent={ErrorFallback}
			resetKeys={[location.pathname]} // 路由路径变化时自动重置错误边界
		>
			{children}
		</ErrorBoundary>
	);
};

const ErrorFallback = ({
	error,
	resetErrorBoundary,
}: {
	error: Error;
	resetErrorBoundary: () => void;
}) => {
	return (
		<div className="flex flex-col items-center justify-center h-full p-4">
			<h2 className="text-2xl font-bold text-error mb-2">
				Oops, something went wrong!
			</h2>
			<p className="text-lg mb-4">An unexpected error occurred.</p>
			<details className="w-full max-w-2xl mb-4">
				<summary className="cursor-pointer text-primary mb-2">
					Error details
				</summary>
				<pre className="bg-error bg-opacity-10 p-4 rounded-box whitespace-pre-wrap">
					<code>{error.toString()}</code>
				</pre>
			</details>
			<div className="flex gap-2">
				<button
					type="button"
					className="btn btn-primary"
					onClick={resetErrorBoundary}
				>
					Try again
				</button>
				<button
					type="button"
					className="btn btn-secondary"
					onClick={() => window.location.reload()}
				>
					Reload page
				</button>
			</div>
		</div>
	);
};
