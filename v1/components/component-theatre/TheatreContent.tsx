import { Canvas } from "@react-three/fiber";
import { getProject } from "@theatre/core";
import { editable as e, PerspectiveCamera, SheetProvider } from "@theatre/r3f";
import extension from "@theatre/r3f/dist/extension";
import studio from "@theatre/studio";
import React, { useEffect } from "react";

import demoProjectState from "./theatre-project-state.json";

// 初始化 Theatre.js
let isInitialized = false;
const initTheatre = () => {
	if (!isInitialized) {
		studio.initialize();
		studio.extend(extension);
		studio.ui.hide();
		isInitialized = true;
	}
};

let demoSheet: any;

export const TheatreContent: React.FC = () => {
	const [isReady, setIsReady] = React.useState(false);

	useEffect(() => {
		initTheatre();
		demoSheet = getProject("Demo Project", { state: demoProjectState }).sheet(
			"Demo Sheet",
		);

		demoSheet.project.ready.then(() => {
			console.log("Project loaded!");
			demoSheet.sequence.play();
			setIsReady(true);
		});
	}, []);

	if (!isReady) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-lg">Initializing Theatre.js...</p>
			</div>
		);
	}

	return (
		<Canvas gl={{ preserveDrawingBuffer: true }}>
			<SheetProvider sheet={demoSheet}>
				<PerspectiveCamera
					theatreKey="Camera"
					makeDefault
					position={[5, 5, -5]}
					fov={75}
				/>
				<ambientLight />
				<e.pointLight theatreKey="Light" position={[10, 10, 10]} />
				<e.mesh theatreKey="Cube">
					<boxGeometry args={[1, 1, 1]} />
					<meshStandardMaterial color="orange" />
				</e.mesh>
			</SheetProvider>
		</Canvas>
	);
};
