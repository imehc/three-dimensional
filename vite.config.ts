import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	server: {
		host: "0.0.0.0",
		port: 6012,
	},
	css: {
		transformer: 'postcss',
	},

	optimizeDeps: {
		include: ["@theatre/core", "@theatre/studio", "@theatre/r3f"],
		esbuildOptions: {
			// 确保正确处理 CommonJS 模块
			mainFields: ['module', 'main'],
		},
	},
	ssr: {
		external: ["@theatre/core", "@theatre/studio", "@theatre/r3f"],
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					// 只在客户端构建时进行代码分割
					if (id.includes('node_modules')) {
						// Three.js 核心
						if (id.includes('three')) {
							return 'three-core';
						}
						// React Three Fiber 生态
						if (id.includes('@react-three/fiber') || id.includes('@react-three/drei')) {
							return 'r3f-vendor';
						}
						// Theatre.js 相关
						if (id.includes('@theatre/')) {
							return 'theatre';
						}
						// Leva
						if (id.includes('leva')) {
							return 'leva';
						}
						// D3
						if (id.includes('d3')) {
							return 'd3';
						}
						// GSAP
						if (id.includes('gsap') || id.includes('tween')) {
							return 'gsap';
						}
					}
				},
			},
		},
		// 提高 chunk 大小警告阈值到 1000 KB
		chunkSizeWarningLimit: 1000,
	},
});
