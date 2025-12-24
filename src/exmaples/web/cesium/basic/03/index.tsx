import { useEffect, useRef } from "react";
import Container from "../../../componets/Container";
import { initViewer } from "./viewer";

export default function App() {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = ref.current;
		if (!container) return;
		const viewer = initViewer(container);

		return () => {
			if (!viewer.isDestroyed()) {
				viewer.destroy();
			}
		};
	}, []);

	return (
		<Container>
			<div className="tw:size-full" ref={ref} />
		</Container>
	);
}
