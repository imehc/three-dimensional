import { useEffect, useRef, useState } from "react";
import Container from "../../../componets/Container";
import Loading from "../../../componets/Loading";
import type Model from "./vanilla-bird";

export default function Bird() {
	const containerRef = useRef<HTMLDivElement>(null);
	const modelRef = useRef<Model | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const initializedRef = useRef(false); // 防止重复初始化

	useEffect(() => {
		const container = containerRef.current;
		if (!container || initializedRef.current) return;

		initializedRef.current = true;

		// 动态导入Model类，只在客户端加载
		import("./vanilla-bird").then(({ Model }) => {
			// 再次检查，防止竞态条件
			if (modelRef.current) {
				return;
			}

			// 创建Model实例
			const model = new Model(container);
			modelRef.current = model;

			// 初始化并加载鸟模型
			model.init().then(() => {
				setIsLoading(false);
				// 启动渲染循环
				model.start();
			});
		});

		// 清理函数
		return () => {
			if (modelRef.current) {
				modelRef.current.stop();
				modelRef.current.dispose();
				modelRef.current = null;
			}
			initializedRef.current = false;
		};
	}, []);

	return (
		<Container>
			{isLoading && <Loading />}
			<div
				ref={containerRef}
				className="tw:size-full"
				style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.3s" }}
			/>
		</Container>
	);
}
