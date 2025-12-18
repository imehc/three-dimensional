import { Vector3 } from "three";
import { create } from "zustand";

interface Props {
	to: Vector3;
	orbitmode: boolean;
	setOrbitmode(o: boolean): void;
	autoRotate: boolean;
	setAutoRotate(a: boolean): void;
}

export const useStore = create<Props>((set) => ({
	to: new Vector3(0, 1, 10),
	orbitmode: false,
	setOrbitmode: (v) => set({ orbitmode: v }),
	autoRotate: false,
	setAutoRotate: (v) => set({ autoRotate: v }),
}));
