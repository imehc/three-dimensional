import { useCallback, useRef, useState } from "react";

export interface ImageLoadResult {
	image: HTMLImageElement;
	width: number;
	height: number;
}

export interface UseImageLoaderReturn {
	loadImage: (src: string) => Promise<ImageLoadResult>;
	isLoading: boolean;
	error: Error | null;
	imageRef: React.RefObject<HTMLImageElement | null>;
}

/**
 * 用于加载图片并管理加载状态和错误状态的Hook
 */
export function useImageLoader(): UseImageLoaderReturn {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);

	const loadImage = useCallback((src: string): Promise<ImageLoadResult> => {
		// 设置初始状态
		setIsLoading(true);
		setError(null);

		return new Promise((resolve, reject) => {
			const img = new Image();
			// 设置跨域属性
			img.crossOrigin = "Anonymous";
			img.src = src;

			// 图片加载成功回调
			img.onload = () => {
				imageRef.current = img;
				setIsLoading(false);
				resolve({
					image: img,
					width: img.width,
					height: img.height,
				});
			};

			// 图片加载失败回调
			img.onerror = () => {
				const err = new Error(`图片加载失败: ${src}`);
				setError(err);
				setIsLoading(false);
				imageRef.current = null;
				reject(err);
			};
		});
	}, []);

	return {
		loadImage,
		isLoading,
		error,
		imageRef,
	};
}