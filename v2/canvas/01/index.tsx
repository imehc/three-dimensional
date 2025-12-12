import { Loading } from "components/component-loading";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import { useImageLoader } from "../hooks/useImageLoader";
import {
	applyMosaicEffect,
	calculateCanvasSize,
	exportCanvas,
	initializeCanvas,
} from "../utils/canvasUtils";

export default function Canvas01() {
	const originalCanvasRef = useRef<HTMLCanvasElement>(null);
	const mosaicCanvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const exampleImageSrc = useMemo(() => "https://picsum.photos/640/640", []);

	const [imageSrc, setImageSrc] = useState<string>(exampleImageSrc);
	const [imageLoaded, setImageLoaded] = useState<boolean>(false);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
	const [blockSize, setBlockSize] = useState<number>(10);
	const [tempBlockSize, setTempBlockSize] = useState<number>(10);

	const { loadImage, imageRef } = useImageLoader();
	const { fileInputRef, handleFileChange, triggerFileUpload } = useFileUpload(
		(dataUrl) => {
			setImageLoaded(false);
			imageRef.current = null;
			setImageSrc(dataUrl);
		},
	);

	// Apply mosaic effect to existing loaded image
	const applyMosaicEffectToCanvas = useEffectEvent(
		(mosaicBlockSize: number) => {
			const mosaicCanvas = mosaicCanvasRef.current;

			if (!mosaicCanvas || !imageRef.current) {
				return;
			}

			const img = imageRef.current;

			// Re-initialize only the mosaic canvas (original canvas stays unchanged)
			initializeCanvas(mosaicCanvas, img);

			// Apply mosaic effect
			applyMosaicEffect(mosaicCanvas, mosaicBlockSize);

			setImageLoaded(true);
			setIsProcessing(false);
		},
	);

	// Process new image
	const processImage = useEffectEvent(async (src: string) => {
		setIsProcessing(true);
		setImageLoaded(false);
		const container = containerRef.current;
		const originalCanvas = originalCanvasRef.current;
		const mosaicCanvas = mosaicCanvasRef.current;

		if (!originalCanvas || !mosaicCanvas || !container) {
			setIsProcessing(false);
			return;
		}

		try {
			const { image: img } = await loadImage(src);

			// Calculate canvas display size
			const containerWidth = container.clientWidth / 2 - 8;
			const containerHeight = container.clientHeight;
			const size = calculateCanvasSize(
				containerWidth,
				containerHeight,
				img.width,
				img.height,
			);

			setCanvasSize(size);

			// Initialize both canvases
			initializeCanvas(originalCanvas, img);
			initializeCanvas(mosaicCanvas, img);

			// Apply mosaic effect
			applyMosaicEffect(mosaicCanvas, blockSize);

			setImageLoaded(true);
			setIsProcessing(false);
		} catch {
			setImageLoaded(false);
			setIsProcessing(false);
			setCanvasSize({ width: 0, height: 0 });
		}
	});

	useEffect(() => {
		processImage(imageSrc);
	}, [imageSrc]);

	const handleUploadClick = () => {
		triggerFileUpload();
	};

	const handleExportClick = () => {
		const mosaicCanvas = mosaicCanvasRef.current;
		if (!mosaicCanvas) return;
		exportCanvas(mosaicCanvas, "mosaic-image.png");
	};

	const handleExportOriginalClick = () => {
		const originalCanvas = originalCanvasRef.current;
		if (!originalCanvas) return;
		exportCanvas(originalCanvas, "original-image.png");
	};

	const handleRefreshClick = () => {
		imageRef.current = null;
		processImage(`${exampleImageSrc}?${Date.now()}`);
	};

	const handleBlockSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const size = parseInt(e.target.value, 10);
		setTempBlockSize(size);
	};

	const handleBlockSizeChangeComplete = () => {
		setBlockSize(tempBlockSize);
		// Use setTimeout to avoid blocking the UI during processing
		setIsProcessing(true);
		applyMosaicEffectToCanvas(tempBlockSize);
	};

	return (
		<div className="flex flex-col w-full h-full items-center justify-center">
			<div className="w-full max-w-7xl flex flex-col h-full p-4">
				<div className="flex gap-2 mb-4 justify-center flex-wrap">
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						accept="image/*"
						className="hidden"
					/>
					<button
						type="button"
						onClick={handleUploadClick}
						disabled={isProcessing}
						className={`px-4 py-2 text-white rounded transition-colors ${
							isProcessing
								? "bg-gray-400 cursor-not-allowed"
								: "bg-primary hover:bg-primary-dark"
						}`}
					>
						选择图片
					</button>
					<button
						type="button"
						onClick={handleRefreshClick}
						disabled={!imageSrc || isProcessing}
						className={`px-4 py-2 text-white rounded transition-colors ${
							!imageSrc || isProcessing
								? "bg-gray-400 cursor-not-allowed"
								: "bg-accent hover:bg-accent-dark"
						}`}
					>
						刷新
					</button>
					<button
						type="button"
						onClick={handleExportOriginalClick}
						disabled={!imageLoaded || isProcessing}
						className={`px-4 py-2 text-white rounded transition-colors ${
							!imageLoaded || isProcessing
								? "bg-gray-400 cursor-not-allowed"
								: "bg-info hover:bg-info-dark"
						}`}
					>
						导出原始图片
					</button>
					<button
						type="button"
						onClick={handleExportClick}
						disabled={!imageLoaded || isProcessing}
						className={`px-4 py-2 text-white rounded transition-colors ${
							!imageLoaded || isProcessing
								? "bg-gray-400 cursor-not-allowed"
								: "bg-secondary"
						}`}
					>
						导出马赛克图片
					</button>
				</div>
				{/* 添加 blockSize 控制器 */}
				<div className="flex gap-2 mb-4 justify-center items-center">
					<span className="text-sm font-medium">马赛克块大小:</span>
					<input
						type="range"
						min="2"
						max="50"
						value={tempBlockSize}
						onChange={handleBlockSizeChange}
						onMouseUp={handleBlockSizeChangeComplete}
						onTouchEnd={handleBlockSizeChangeComplete}
						disabled={isProcessing}
						className="range range-primary w-48"
					/>
					<span className="text-sm font-medium w-8">{blockSize}px</span>
				</div>
				<div ref={containerRef} className="flex flex-1 gap-4 min-h-0">
					<div className="flex-1 flex items-center justify-center relative">
						<canvas
							ref={originalCanvasRef}
							style={{
								width: canvasSize.width || "auto",
								height: canvasSize.height || "auto",
								display: canvasSize.width ? "block" : "none",
							}}
							className="border border-secondary rounded-xl shadow-lg"
						/>
						{!imageLoaded && <Loading />}
					</div>
					<div className="flex-1 flex items-center justify-center relative">
						<canvas
							ref={mosaicCanvasRef}
							style={{
								width: canvasSize.width || "auto",
								height: canvasSize.height || "auto",
								display: canvasSize.width ? "block" : "none",
							}}
							className="border border-secondary rounded-xl shadow-lg"
						/>
						{(!imageLoaded || isProcessing) && <Loading />}
					</div>
				</div>
			</div>
		</div>
	);
}
