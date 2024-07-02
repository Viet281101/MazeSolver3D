import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function initMaze(canvas: HTMLCanvasElement, mazeLayer: number = 1) {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	const renderer = new THREE.WebGLRenderer({ canvas });

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);

	function createWall(x: number, y: number, z: number, width: number, height: number, depth: number) {
		const geometry = new THREE.BoxGeometry(width, height, depth);
		const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
		const wall = new THREE.Mesh(geometry, material);
		wall.position.set(x, y, z);
		scene.add(wall);
	}

	const maze = [
		[1, 0, 1, 1, 1, 1],
		[1, 0, 0, 1, 0, 1],
		[1, 1, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 1]
	];

	const wallHeight = 1;
	const wallThickness = 0.1;
	const cellSize = 1;

	for (let layer = 0; layer < mazeLayer; layer++) {
		for (let i = 0; i < maze.length; i++) {
			for (let j = 0; j < maze[i].length; j++) {
				if (maze[i][j] === 1) {
					if (j < maze[i].length - 1 && maze[i][j + 1] === 1) {
						createWall(j * cellSize + cellSize / 2, wallHeight / 2 + layer * (wallHeight + 0.5), -i * cellSize, cellSize, wallHeight, wallThickness);
					}
					if (i < maze.length - 1 && maze[i + 1][j] === 1) {
						createWall(j * cellSize, wallHeight / 2 + layer * (wallHeight + 0.5), -(i * cellSize + cellSize / 2), wallThickness, wallHeight, cellSize);
					}
				}
			}
		}
	}

	for (let layer = 0; layer < mazeLayer; layer++) {
		const floorGeometry = new THREE.PlaneGeometry(maze[0].length * cellSize, maze.length * cellSize);
		const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xC0C0C0, side: THREE.DoubleSide });
		const floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -wallThickness / 2 + layer * (wallHeight + 0.5);
		floor.position.z = -maze.length * cellSize / 2 + cellSize / 2;
		floor.position.x = maze[0].length * cellSize / 2 - cellSize / 2;
		scene.add(floor);
	}

	const mazeCenterX = (maze[0].length * cellSize) / 2 - cellSize / 2;
	const mazeCenterZ = -(maze.length * cellSize) / 2 + cellSize / 2;
	camera.position.set(mazeCenterX, 5, maze.length);
	controls.target.set(mazeCenterX, 0, mazeCenterZ);
	controls.update();

	function animate() {
		requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene, camera);
	}

	animate();
}
