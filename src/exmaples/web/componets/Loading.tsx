export default function Loading() {
    return (
        <div className="absolute left-1/2 top-1/2 -translate-1/2">
            <div className="flex flex-col items-center justify-center">
                {/* Spinning loader */}
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-secondary border-b-transparent rounded-full animate-spin-reverse"></div>
                </div>

                {/* Loading text */}
                <div className="text-base-content text-opacity-80 text-sm mb-1">
                    Loading...
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
        </div>
    );
};