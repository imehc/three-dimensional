export const Floor: React.FC = () => {
	return (
		<mesh rotation-x={-Math.PI / 2} receiveShadow>
			<circleGeometry args={[10]} />
			<meshStandardMaterial />
		</mesh>
	);
};
