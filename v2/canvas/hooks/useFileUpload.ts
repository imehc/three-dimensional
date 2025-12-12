import { useCallback, useRef } from "react";

export interface UseFileUploadReturn {
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	triggerFileUpload: () => void;
}

/**
 * 用于处理带隐藏输入框的文件上传的Hook
 */
export function useFileUpload(
	onFileLoaded: (dataUrl: string) => void
): UseFileUploadReturn {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			// 获取选择的文件
			const file = e.target.files?.[0];
			if (file) {
				// 使用FileReader读取文件
				const reader = new FileReader();
				reader.onload = (event) => {
					// 文件加载完成后回调
					if (event.target?.result) {
						onFileLoaded(event.target.result as string);
					}
				};
				reader.readAsDataURL(file);
			}
		},
		[onFileLoaded]
	);

	const triggerFileUpload = useCallback(() => {
		// 触发文件上传操作
		fileInputRef.current?.click();
	}, []);

	return {
		fileInputRef,
		handleFileChange,
		triggerFileUpload,
	};
}