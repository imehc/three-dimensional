import { useEffect, useRef } from 'react'

export default function Home() {
	const gameContainerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		let game: Phaser.Game | null = null

		import('~/entry').then((module) => {
			if (gameContainerRef.current) {
				game = module.createGame(gameContainerRef.current)
			}
		})

		// 处理窗口大小调整
		const handleResize = () => {
			if (game) {
				game.scale.resize(window.innerWidth, window.innerHeight);
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			if (game) {
				game.destroy(true)
			}
		}
	}, [])

	return (
		<div
			ref={gameContainerRef}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				overflow: 'hidden'
			}}
		/>
	)
}