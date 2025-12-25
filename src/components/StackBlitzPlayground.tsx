import sdk, { type ProjectTemplate } from "@stackblitz/sdk";
import { useEffect, useRef, useState } from "react";
import Loading from "../exmaples/web/componets/Loading";

export interface StackBlitzPlaygroundProps {
	files: Record<string, string>;
	title?: string;
	description?: string;
	template?: ProjectTemplate;
	height?: number;
	openFile?: string | string[];
	hideNavigation?: boolean;
	hideDevTools?: boolean;
	dependencies?: Record<string, string>;
}

export default function StackBlitzPlayground({
	files,
	title = "Code Example",
	description = "Code example from documentation",
	template = "node",
	height = 500,
	openFile,
	hideNavigation = false,
	hideDevTools = false,
	dependencies,
}: StackBlitzPlaygroundProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!containerRef.current) return;

		let timeoutId: NodeJS.Timeout;
		let mounted = true;

		const embedStackBlitz = async () => {
			try {
				setLoading(true);
				setError(null);

				// 清空容器
				if (containerRef.current) {
					containerRef.current.innerHTML = "";
				}

				// 构建 StackBlitz 项目配置
				const project = {
					title,
					description,
					template,
					files,
					...(dependencies && { dependencies }),
				};

				// 设置超时
				const timeoutPromise = new Promise((_, reject) => {
					timeoutId = setTimeout(() => {
						reject(new Error("Connection timeout"));
					}, 20000); // 20秒超时
				});

				// 嵌入 StackBlitz 编辑器
				if (!containerRef.current) return;

				const embedPromise = sdk.embedProject(containerRef.current, project, {
					openFile,
					hideNavigation,
					hideDevTools,
					height,
					view: "default",
					clickToLoad: false,
				});

				await Promise.race([embedPromise, timeoutPromise]);

				if (mounted) {
					setLoading(false);
				}
			} catch (err) {
				console.error("StackBlitz embed error:", err);
				if (mounted) {
					setError(
						err instanceof Error
							? err.message
							: "Unable to load StackBlitz editor",
					);
					setLoading(false);
				}
			} finally {
				clearTimeout(timeoutId);
			}
		};

		embedStackBlitz();

		return () => {
			mounted = false;
			clearTimeout(timeoutId);
		};
	}, [
		files,
		title,
		description,
		template,
		openFile,
		hideNavigation,
		hideDevTools,
		height,
		dependencies,
	]);

	if (error) {
		return (
			<div
				className="tw:border tw:border-base-300 tw:box-border tw:flex tw:items-center tw:justify-center tw:flex-col"
				style={{ height }}
			>
				<div className="tw:text-neutral-300 mb-3">
					⚠️ Failed to load StackBlitz editor
				</div>
				<div className="tw:text-neutral-300 mb-3">{error}</div>
			</div>
		);
	}

	return (
		<div className="tw:size-full tw:flex tw:justify-center tw:items-center" style={{ height }}>
			<div
				ref={containerRef}
				style={{ display: loading ? "none" : "block" }}
				className="tw:flex tw:justify-center tw:items-center"
			></div>
			{loading && <Loading loadText="loading StackBlitz editor" />}
		</div>
	);
}
