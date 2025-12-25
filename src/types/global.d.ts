// 全局环境变量类型声明
declare const CESIUM_BASE_URL: string;
declare const CESIUM_ACCESS_TOKEN: string;

// 支持 ?raw 查询参数导入文件为纯文本
declare module "*?raw" {
	const content: string;
	export default content;
}
