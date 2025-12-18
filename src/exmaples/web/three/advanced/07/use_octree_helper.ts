import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect } from "react";
import { OctreeHelper } from "three/addons/helpers/OctreeHelper.js";
import type { Octree } from "three/addons/math/Octree.js";

export const useOctreeHelper = (octree: Octree) => {
	const { scene } = useThree();

	useEffect(() => {
		console.log("new OctreeHelper");
		const helper = new OctreeHelper(octree, "hotpink");
		helper.name = "octreeHelper";
		scene.add(helper);

		return () => {
			console.log("removing OctreeHelper");
			scene.remove(helper);
		};
	}, [octree, scene]);

	useControls("Octree Helper 八叉树", {
		visible: {
			value: false,
			onChange: (v) => {
				scene.getObjectByName("octreeHelper")!.visible = v;
				if (document.getElementById("Octree Helper.visible"))
					document.getElementById("Octree Helper.visible")!.blur();
			},
		},
	});
};
