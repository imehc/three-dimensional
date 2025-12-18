interface Props {
	radius: number;
}

/**
 * 球
 */
export const Ball: React.FC<Props> = ({ radius }) => {
	return (
		<mesh castShadow>
			<sphereGeometry args={[radius]} />
			<meshStandardMaterial />
		</mesh>
	);
};
