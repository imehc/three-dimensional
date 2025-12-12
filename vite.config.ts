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
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					// 只在客户端构建时进行代码分割
					if (id.includes('node_modules')) {
						// D3
						if (id.includes('d3')) {
							return 'd3';
						}
					}
				},
			},
		},
		// 提高 chunk 大小警告阈值到 1000 KB
		chunkSizeWarningLimit: 1000,
	},
});
