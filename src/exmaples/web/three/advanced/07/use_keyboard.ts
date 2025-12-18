import { useEffect, useRef } from "react";

export const useKeyboard = () => {
	const keyMap = useRef<Record<string, unknown>>({});

	useEffect(() => {
		const onDocumentKey = (e: KeyboardEvent) => {
			keyMap.current[e.code] = e.type === "keydown";
		};
		document.addEventListener("keydown", onDocumentKey);
		document.addEventListener("keyup", onDocumentKey);
		return () => {
			document.removeEventListener("keydown", onDocumentKey);
			document.removeEventListener("keyup", onDocumentKey);
		};
	});

	return keyMap.current;
};
