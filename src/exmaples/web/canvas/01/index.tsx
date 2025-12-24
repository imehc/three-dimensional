import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import Container from "../../componets/Container";
import Loading from "../../componets/Loading";
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
		<Container className="tw:flex tw:flex-col tw:sm:w-full tw:md:w-2xl tw:aspect-video tw:items-center tw:justify-center">
			<div className="tw:w-full tw:max-w-7xl tw:flex tw:flex-col tw:h-full tw:p-4">
				<div className="tw:flex tw:gap-2 tw:mb-4 tw:justify-center tw:flex-wrap">
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						accept="image/*"
						className="tw:hidden"
					/>
					<button
						type="button"
						onClick={handleUploadClick}
						disabled={isProcessing}
						className={`tw:px-4 tw:py-2 tw:text-white tw:rounded tw:transition-colors ${
							isProcessing
								? "tw:bg-gray-400 tw:cursor-not-allowed"
								: "tw:bg-primary tw:hover:bg-primary-dark"
						}`}
					>
						选择图片
					</button>
					<button
						type="button"
						onClick={handleRefreshClick}
						disabled={!imageSrc || isProcessing}
						className={`tw:px-4 tw:py-2 tw:text-white tw:rounded tw:transition-colors ${
							!imageSrc || isProcessing
								? "tw:bg-gray-400 tw:cursor-not-allowed"
								: "tw:bg-accent tw:hover:bg-accent-dark"
						}`}
					>
						刷新
					</button>
					<button
						type="button"
						onClick={handleExportOriginalClick}
						disabled={!imageLoaded || isProcessing}
						className={`tw:px-4 tw:py-2 tw:text-white tw:rounded tw:transition-colors ${
							!imageLoaded || isProcessing
								? "tw:bg-gray-400 tw:cursor-not-allowed"
								: "tw:bg-info tw:hover:bg-info-dark"
						}`}
					>
						导出原始图片
					</button>
					<button
						type="button"
						onClick={handleExportClick}
						disabled={!imageLoaded || isProcessing}
						className={`tw:px-4 tw:py-2 tw:text-white tw:rounded tw:transition-colors ${
							!imageLoaded || isProcessing
								? "tw:bg-gray-400 tw:cursor-not-allowed"
								: "tw:bg-secondary"
						}`}
					>
						导出马赛克图片
					</button>
				</div>
				{/* 添加 blockSize 控制器 */}
				<div className="tw:flex tw:gap-2 tw:mb-4 tw:justify-center tw:items-center">
					<span className="tw:text-sm tw:font-medium">马赛克块大小:</span>
					<input
						type="range"
						min="2"
						max="50"
						value={tempBlockSize}
						onChange={handleBlockSizeChange}
						onMouseUp={handleBlockSizeChangeComplete}
						onTouchEnd={handleBlockSizeChangeComplete}
						disabled={isProcessing}
						className="tw:range tw:range-primary tw:w-48"
					/>
					<span className="tw:text-sm tw:font-medium tw:w-8 tw:whitespace-nowrap">
						{blockSize}px
					</span>
				</div>
				<div ref={containerRef} className="tw:flex tw:flex-1 tw:gap-4 tw:min-h-0">
					<div className="tw:flex-1 tw:flex tw:items-center tw:justify-center tw:relative">
						<canvas
							ref={originalCanvasRef}
							style={{
								width: canvasSize.width || "auto",
								height: canvasSize.height || "auto",
								display: canvasSize.width ? "block" : "none",
							}}
							className="tw:border tw:border-secondary tw:rounded-xl tw:shadow-lg"
						/>
						{!imageLoaded && <Loading />}
					</div>
					<div className="tw:flex-1 tw:flex tw:items-center tw:justify-center tw:relative">
						<canvas
							ref={mosaicCanvasRef}
							style={{
								width: canvasSize.width || "auto",
								height: canvasSize.height || "auto",
								display: canvasSize.width ? "block" : "none",
							}}
							className="tw:border tw:border-secondary tw:rounded-xl tw:shadow-lg"
						/>
						{(!imageLoaded || isProcessing) && <Loading />}
					</div>
				</div>
			</div>
		</Container>
	);
}
