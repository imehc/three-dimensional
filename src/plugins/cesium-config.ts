import { config } from "dotenv";
import path from "node:path";

// 加载 .env 文件
config();

const cesiumSource = "node_modules/cesium/Build/Cesium";
const cesiumBaseUrl = "cesiumStatic";

module.exports = async function cesiumPlugin() {
	return {
		name: "cesium-plugin",
		configureWebpack(_config: unknown, isServer: boolean, { currentBundler }) {
			// Only apply Cesium configuration for client bundle
			if (isServer) {
				return {};
			}

			// Use rspack's CopyRspackPlugin instead of CopyWebpackPlugin
			const CopyPlugin = currentBundler.instance.CopyRspackPlugin;

			return {
				plugins: [
					// Copy Cesium static files
					new CopyPlugin({
						patterns: [
							{
								from: path.join(cesiumSource, "Workers"),
								to: `${cesiumBaseUrl}/Workers`,
							},
							{
								from: path.join(cesiumSource, "ThirdParty"),
								to: `${cesiumBaseUrl}/ThirdParty`,
							},
							{
								from: path.join(cesiumSource, "Assets"),
								to: `${cesiumBaseUrl}/Assets`,
							},
							{
								from: path.join(cesiumSource, "Widgets"),
								to: `${cesiumBaseUrl}/Widgets`,
							},
						],
					}),
					// Define global constants for the runtime
					// 从 .env 文件读取
					new currentBundler.instance.DefinePlugin({
						CESIUM_BASE_URL: JSON.stringify(`/${cesiumBaseUrl}`),
						CESIUM_ACCESS_TOKEN: JSON.stringify(process.env.CESIUM_ACCESS_TOKEN || ""),
					}),
				],
			};
		},
	};
};
