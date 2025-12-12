import { Loading } from "components/component-loading";
import { useEffect, useState } from "react";

/**
 * 场景编辑器demo
 * @link https://www.theatrejs.com/
 */
export const TheatreDemo: React.FC = () => {
	const [isClient, setIsClient] = useState(false);
	const [TheatreContent, setTheatreContent] = useState<React.ComponentType | null>(null);

	useEffect(() => {
		setIsClient(true);

		// 动态导入 Theatre.js 相关模块（仅在客户端）
		import("./TheatreContent").then((module) => {
			setTheatreContent(() => module.TheatreContent);
		}).catch((error) => {
			console.error("Failed to load Theatre.js:", error);
		});
	}, []);

	if (!isClient || !TheatreContent) {
		return (
			<Loading />
		);
	}

	return <TheatreContent />;
};

export default TheatreDemo;
