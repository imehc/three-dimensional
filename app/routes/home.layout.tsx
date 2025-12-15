
import { Loading } from "components/component-loading";
import { RouteAwareErrorBoundary } from "components/component-route-aware-error-boundary";
import { Suspense, } from "react";
import { Outlet, } from "react-router";

export function meta() {
	return [
		{ title: "Learn phaser" },
		{ name: "description", content: "Welcome to Learn Phaser App" },
	];
}

export default function HomeLayout() {
	return (
		<main className="w-screen h-screen">
			<RouteAwareErrorBoundary>
				<Suspense fallback={<Loading />}>
					<Outlet />
				</Suspense>
			</RouteAwareErrorBoundary>
		</main>
	);
}
