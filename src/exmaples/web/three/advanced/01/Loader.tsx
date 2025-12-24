import { Html, useProgress } from "@react-three/drei";

interface Props {
	position: [number, number, number];
}

export const Loader: React.FC<Props> = ({ position }) => {
	const { progress, active, item, loaded, total } = useProgress();

	return (
		<Html position={position} center>
			<div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:p-8 tw:bg-base-300 tw:bg-opacity-95 tw:rounded-2xl tw:backdrop-blur-md tw:shadow-2xl tw:border tw:border-base-content tw:border-opacity-20">
				{/* Spinning loader */}
				<div className="tw:relative tw:size-20 tw:mb-6">
					<div className="tw:absolute tw:inset-0 tw:border-4 tw:border-primary tw:border-t-transparent tw:rounded-full tw:animate-spin"></div>
					<div className="tw:absolute tw:inset-2 tw:border-4 tw:border-secondary tw:border-b-transparent tw:rounded-full tw:animate-spin-reverse"></div>
				</div>

				{/* Progress percentage */}
				<div className="tw:text-base-content tw:text-3xl tw:font-bold tw:mb-2">
					{progress.toFixed(0)}%
				</div>

				{/* Loading text */}
				<div className="tw:text-base-content tw:text-opacity-80 tw:text-sm tw:mb-1">
					Loading Model...
				</div>

				{/* File info */}
				{active && item && (
					<div className="tw:text-base-content tw:text-opacity-60 tw:text-xs tw:mb-4 tw:max-w-xs tw:truncate">
						{item}
					</div>
				)}

				{/* Progress bar */}
				<div className="tw:w-64 tw:h-3 tw:bg-base-100 tw:rounded-full tw:overflow-hidden tw:shadow-inner">
					<div
						className="tw:h-full tw:bg-linear-to-r tw:from-primary tw:via-secondary tw:to-accent tw:rounded-full tw:transition-all tw:duration-500 tw:ease-out tw:shadow-lg"
						style={{ width: `${progress}%` }}
					></div>
				</div>

				{/* Files loaded counter */}
				<div className="tw:text-base-content tw:text-opacity-60 tw:text-xs tw:mt-3">
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
