import { useMemo } from "react";
import type { Group, Object3DEventMap } from "three";
import { Octree } from "three/addons/math/Octree.js";

/**
 * 用于从三维场景中构建八叉树,以支持更高效的空间查询需求
 */
export const useOctree = (scene: Group<Object3DEventMap>) => {
	const octree = useMemo(() => {
		console.log("new Octree");
		return new Octree().fromGraphNode(scene);
	}, [scene]);

	return octree;
};
