import { Canvas } from "@react-three/fiber";
import { Box } from "./Box";
import Container from "../../../componets/Container";

/**
 * 鼠标事件示例
 *
 * 核心概念：
 * - React Three Fiber 提供了 React 风格的事件处理
 * - 鼠标事件直接绑定在 mesh 组件上
 */
export default function App() {
  return (
    <Container>
      <Canvas camera={{ position: [0, 0, 2] }}>
        {/* 创建两个立方体，每个都有鼠标事件处理 */}
        <Box position={[-0.75, 0, 0]} name="A" />
        <Box position={[0.75, 0, 0]} name="B" />
      </Canvas>
    </Container>
  );
}