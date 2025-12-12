import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Easing, Tween } from "@tweenjs/tween.js";
import { useState } from "react";
import annotations from "./annotations.json";
import { tweenGroup } from "./index";

export const Annotations: React.FC<any> = ({ controls }) => {
	const { camera } = useThree();
	const [selected, setSelected] = useState(-1);

	return (
		<>
			{annotations.map((a, i) => {
				return (
					<Html key={a.title} position={[a.lookAt.x, a.lookAt.y, a.lookAt.z]}>
						<svg
							height="34"
							width="34"
							transform="translate(-16 -16)"
							style={{ cursor: "pointer" }}
						>
							<title>{a.title}</title>
							<circle
								cx="17"
								cy="17"
								r="16"
								stroke="white"
								strokeWidth="2"
								fill="rgba(0,0,0,.66)"
								onPointerUp={() => {
									setSelected(i);
									// change target
									const targetTween = new Tween(
										controls.current.target,
										tweenGroup,
									)
										.to(
											{
												x: a.lookAt.x,
												y: a.lookAt.y,
												z: a.lookAt.z,
											},
											1000,
										)
										.easing(Easing.Cubic.Out);
									targetTween.start();

									// change camera position
									const cameraTween = new Tween(camera.position, tweenGroup)
										.to(
											{
												x: a.camPos.x,
												y: a.camPos.y,
												z: a.camPos.z,
											},
											1000,
										)
										.easing(Easing.Cubic.Out);
									cameraTween.start();
								}}
							/>
							<text
								x="12"
								y="22"
								fill="white"
								fontSize={17}
								fontFamily="monospace"
								style={{ pointerEvents: "none" }}
							>
								{i + 1}
							</text>
						</svg>
						{a.description && i === selected && (
							<div
								id={`desc_${i}`}
								className="annotationDescription"
								dangerouslySetInnerHTML={{ __html: a.description }}
							/>
						)}
					</Html>
				);
			})}
		</>
	);
};
