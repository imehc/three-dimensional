module.exports = async function rspackPlugin(context, options) {
	return {
		name: "rspack-plugin",
		configureWebpack(config, isServer, { currentBundler }) {
			return {
				plugins: [new currentBundler.instance.DefinePlugin({})],
				module: {
					rules: [
						{
							resourceQuery: /raw/,
							type: "asset/source",
						},
					],
				},
			};
		},
	};
};
