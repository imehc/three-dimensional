import clsx from "clsx";
import { Loading } from "components/component-loading";
import { RouteAwareErrorBoundary } from "components/component-route-aware-error-boundary";
import { Fragment, Suspense, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import menus from "../menus";

type ThemeMode = "light" | "dark" | "system";

export function meta() {
	return [
		{ title: "Learn Threejs" },
		{ name: "description", content: "Welcome to Learn Threejs App" },
	];
}

export default function HomeLayout() {
	const location = useLocation();
	const [themeMode, setThemeMode] = useState<ThemeMode>("system");
	const [isClient, setIsClient] = useState(false);
	const activeItemRef = useRef<HTMLLIElement>(null);

	// 首次客户端渲染时读取 localStorage
	useEffect(() => {
		setIsClient(true);
		const stored = localStorage.getItem("theme-mode");
		if (stored) {
			setThemeMode(stored as ThemeMode);
		}
	}, []);

	useEffect(() => {
		if (!isClient) return;

		const applyTheme = (mode: ThemeMode) => {
			let actualTheme: "light" | "dark";

			if (mode === "system") {
				actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light";
			} else {
				actualTheme = mode;
			}

			document.documentElement.setAttribute("data-theme", actualTheme);
		};

		applyTheme(themeMode);
		localStorage.setItem("theme-mode", themeMode);

		if (themeMode === "system") {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			const handler = () => applyTheme("system");
			mediaQuery.addEventListener("change", handler);
			return () => mediaQuery.removeEventListener("change", handler);
		}
	}, [themeMode, isClient]);

	const handleThemeChange = (mode: ThemeMode) => {
		setThemeMode(mode);
	};

	// 滚动到激活的菜单项
	useEffect(() => {
		if (activeItemRef.current) {
			activeItemRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, []);

	return (
		<div className="h-screen flex flex-col">
			{/* Header */}
			<div className="navbar bg-base-100 shadow-lg">
				<div className="flex-1">
					<Link to="/" className="text-xl">
						D3 Demo
					</Link>
				</div>
				<div className="flex-none gap-2">
					<div className="dropdown dropdown-end">
						<button
							type="button"
							tabIndex={0}
							className="btn btn-ghost btn-circle"
							aria-label="主题切换"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-6 h-6"
							>
								<title>主题切换</title>
								{themeMode === "light" ? (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
									/>
								) : themeMode === "dark" ? (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
									/>
								) : (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
									/>
								)}
							</svg>
						</button>
						<ul className="menu dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-32 p-2 shadow">
							<li>
								<button
									type="button"
									onClick={() => handleThemeChange("light")}
									className={clsx({ active: themeMode === "light" })}
								>
									亮色
								</button>
							</li>
							<li>
								<button
									type="button"
									onClick={() => handleThemeChange("dark")}
									className={clsx({ active: themeMode === "dark" })}
								>
									暗色
								</button>
							</li>
							<li>
								<button
									type="button"
									onClick={() => handleThemeChange("system")}
									className={clsx({ active: themeMode === "system" })}
								>
									跟随系统
								</button>
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex flex-1 overflow-hidden bg-base-200 p-4 gap-4">
				{/* Sidebar */}
				<aside className="min-w-64 max-w-80 bg-base-200 flex flex-col overflow-hidden">
					<div className="p-4 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
						{menus.map((category) => (
							<Fragment key={category.category}>
								<h3 className="menu-title text-sm font-semibold px-4">
									{category.category}
								</h3>
								<ul className="menu w-full">
									{category.items.map((item, idx) => {
										const isActive = location.pathname === item.href;
										return (
											<li key={item.href} ref={isActive ? activeItemRef : null}>
												<Link
													to={item.href}
													className={clsx("text-base", {
														"bg-primary text-primary-content": isActive,
													})}
												>
													{(idx + 1).toString().padStart(2, "0")}&nbsp;
													{item.name}
												</Link>
											</li>
										);
									})}
								</ul>
							</Fragment>
						))}
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-1 bg-base-100 border border-solid border-primary rounded-2xl overflow-hidden relative">
					<RouteAwareErrorBoundary>
						<Suspense key={location.pathname} fallback={<Loading />}>
							<Outlet />
						</Suspense>
					</RouteAwareErrorBoundary>
				</main>
			</div>

			{/* Footer */}
			<footer className="footer footer-center p-4 bg-base-200 text-base-content">
				<aside>
					<p>
						&copy; {new Date().getFullYear()}
						{/* My Application. All rights reserved. */}
					</p>
				</aside>
			</footer>
		</div>
	);
}
