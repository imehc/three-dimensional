import Container from "../../../componets/Container";
import { TheatreContent } from "./TheatreContent";

/**
 * Theatre.js 动画编辑器加载组件
 *
 * 核心功能：
 * - 动态导入 Theatre.js 相关模块（仅在客户端）
 * - 实现延迟加载以优化初始加载性能
 * - 提供加载状态显示
 */
const TheatreDemo: React.FC = () => {
	return (
		<Container>
			<TheatreContent />
		</Container>
	);
};

export default TheatreDemo;