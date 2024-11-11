import * as THREE from 'three'
import * as dat from 'dat.gui'
// 轨道控制
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/**
 * Debug
 */
const gui = new dat.GUI()


const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const doorColorTexture = textureLoader.load('/assets/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/assets/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/assets/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/assets/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/assets/textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/assets/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/assets/textures/door/roughness.jpg')
const matcapsTexture = textureLoader.load('/assets/textures/matcaps/8.png')
const gradientsTexture = textureLoader.load('/assets/textures/gradients/5.jpg')
gradientsTexture.minFilter = THREE.NearestFilter
gradientsTexture.magFilter = THREE.NearestFilter
gradientsTexture.generateMipmaps = false

const environmentMapTexture = cubeTextureLoader.load([
  '/assets/textures/environmentMaps/3/px.jpg',
  '/assets/textures/environmentMaps/3/nx.jpg',
  '/assets/textures/environmentMaps/3/py.jpg',
  '/assets/textures/environmentMaps/3/ny.jpg',
  '/assets/textures/environmentMaps/3/pz.jpg',
  '/assets/textures/environmentMaps/3/nz.jpg',
])

// Canvas
const canvas = document.querySelector('.webgl') as HTMLCanvasElement

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
// const material = new THREE.MeshBasicMaterial()
// material.wireframe = true // 网格
// // material.transparent = true
// // material.opacity = 0.5
// material.side = THREE.BackSide // 背面 
// material.side = THREE.DoubleSide // 双面 

// const material = new THREE.MeshNormalMaterial()
// // material.wireframe = true
// material.flatShading = true

// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapsTexture

// const material = new THREE.MeshDepthMaterial()

// const material = new THREE.MeshLambertMaterial()
// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100
// material.specular = new THREE.Color(0xff0000)

// const material = new THREE.MeshToonMaterial()
// material.gradientMap = gradientsTexture

// const material = new THREE.MeshStandardMaterial()
// // material.metalness = 0.45
// // material.roughness = 0.65
// material.map = doorColorTexture
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 1
// material.displacementMap = doorHeightTexture
// material.displacementScale = 0.05
// material.metalnessMap = doorRoughnessTexture
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.5, 0.5)
// material.transparent = true
// material.alphaMap = doorAlphaTexture

const material = new THREE.MeshStandardMaterial()
material.metalness = 0.7
material.roughness = 0.2
material.envMap = environmentMapTexture

// material.wireframe = true

gui.add(material, 'metalness').min(0).max(1).step(0.0001)
gui.add(material, 'roughness').min(0).max(1).step(0.0001)
gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001)
gui.add(material, 'displacementScale').min(0).max(1).step(0.0001)

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 0.2, 164, 128),
  material
)
sphere.position.x = -1.5
// sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))


const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  material
)

// plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.3, 16, 32),
  material,
)

// torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))

torus.position.x = 1.5

scene.add(sphere, plane, torus)

/**
 * Sizes
 */
const size = {
  width: window.innerWidth,
  height: window.innerHeight
}

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xfffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xfffffff, 0.5)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

window.addEventListener('resize', () => {
  // console.log('window has been reset')
  // Update sizes
  size.width = window.innerWidth
  size.height = window.innerHeight

  // Update camera
  camera.aspect = size.width / size.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(size.width, size.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, size.width / size.height, 1, 1000)
camera.position.z = 3




// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true// 阻尼效果,需要在下面添加 update()

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(size.width, size.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  // Update objects
  sphere.rotation.y = 0.1 * elapsedTime
  plane.rotation.y = 0.1 * elapsedTime
  torus.rotation.y = 0.1 * elapsedTime

  sphere.rotation.x = 0.15 * elapsedTime
  plane.rotation.x = 0.15 * elapsedTime
  torus.rotation.x = 0.15 * elapsedTime

  // Update controls
  controls.update()

  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}

tick()