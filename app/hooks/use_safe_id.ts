import { useMemo } from "react";

const count = (() => {
	let i = 0;
	return () => i++;
})();

/**
 * React.useId() 的安全替代，可用于 querySelector()
 * @returns string
 */
export const useSafeId = (): string => {
	return useMemo(() => `__${count()}__`, []);
};
