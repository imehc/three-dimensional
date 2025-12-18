import { Html, useProgress } from "@react-three/drei";

interface Props {
	position: [number, number, number];
}

export const Loader: React.FC<Props> = ({ position }) => {
	const { progress, active, item, loaded, total } = useProgress();

	return (
		<Html position={position} center>
			<div className="flex flex-col items-center justify-center p-8 bg-base-300 bg-opacity-95 rounded-2xl backdrop-blur-md shadow-2xl border border-base-content border-opacity-20">
				{/* Spinning loader */}
				<div className="relative w-20 h-20 mb-6">
					<div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					<div className="absolute inset-2 border-4 border-secondary border-b-transparent rounded-full animate-spin-reverse"></div>
				</div>

				{/* Progress percentage */}
				<div className="text-base-content text-3xl font-bold mb-2">
					{progress.toFixed(0)}%
				</div>

				{/* Loading text */}
				<div className="text-base-content text-opacity-80 text-sm mb-1">
					Loading Model...
				</div>

				{/* File info */}
				{active && item && (
					<div className="text-base-content text-opacity-60 text-xs mb-4 max-w-xs truncate">
						{item}
					</div>
				)}

				{/* Progress bar */}
				<div className="w-64 h-3 bg-base-100 rounded-full overflow-hidden shadow-inner">
					<div
						className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 ease-out shadow-lg"
						style={{ width: `${progress}%` }}
					></div>
				</div>

				{/* Files loaded counter */}
				<div className="text-base-content text-opacity-60 text-xs mt-3">
					{loaded} / {total} files
				</div>
			</div>

			<style>{`
					@keyframes spin-reverse {
						from {
							transform: rotate(360deg);
						}
						to {
							transform: rotate(0deg);
						}
					}
					.animate-spin-reverse {
						animation: spin-reverse 1.5s linear infinite;
					}
				`}</style>
		</Html>
	);
};
