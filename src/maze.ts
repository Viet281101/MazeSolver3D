import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Maze {
	private canvas: HTMLCanvasElement;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private controls: OrbitControls;
	private maze: number[][];
	private wallHeight: number;
	private wallThickness: number;
	private cellSize: number;

	constructor(canvas: HTMLCanvasElement, mazeLayer: number = 1) {
		this.canvas = canvas;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.maze = [
			[1, 0, 1, 1, 1, 1],
			[1, 0, 0, 1, 0, 1],
			[1, 1, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1]
		];

		this.wallHeight = 1;
		this.wallThickness = 0.1;
		this.cellSize = 1;

		this.init(mazeLayer);
		this.animate();
	}

	private createWall(x: number, y: number, z: number, width: number, height: number, depth: number) {
		const geometry = new THREE.BoxGeometry(width, height, depth);
		const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
		const wall = new THREE.Mesh(geometry, material);
		wall.position.set(x, y, z);
		this.scene.add(wall);
	}

	private init(mazeLayer: number) {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		for (let layer = 0; layer < mazeLayer; layer++) {
			for (let i = 0; i < this.maze.length; i++) {
				for (let j = 0; j < this.maze[i].length; j++) {
					if (this.maze[i][j] === 1) {
						if (j < this.maze[i].length - 1 && this.maze[i][j + 1] === 1) {
							this.createWall(j * this.cellSize + this.cellSize / 2, this.wallHeight / 2 + layer * (this.wallHeight + 0.5), -i * this.cellSize, this.cellSize, this.wallHeight, this.wallThickness);
						}
						if (i < this.maze.length - 1 && this.maze[i + 1][j] === 1) {
							this.createWall(j * this.cellSize, this.wallHeight / 2 + layer * (this.wallHeight + 0.5), -(i * this.cellSize + this.cellSize / 2), this.wallThickness, this.wallHeight, this.cellSize);
						}
					}
				}
			}
		}

		for (let layer = 0; layer < mazeLayer; layer++) {
			const floorGeometry = new THREE.PlaneGeometry(this.maze[0].length * this.cellSize, this.maze.length * this.cellSize);
			const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xC0C0C0, side: THREE.DoubleSide });
			const floor = new THREE.Mesh(floorGeometry, floorMaterial);
			floor.rotation.x = -Math.PI / 2;
			floor.position.y = -this.wallThickness / 2 + layer * (this.wallHeight + 0.5);
			floor.position.z = -this.maze.length * this.cellSize / 2 + this.cellSize / 2;
			floor.position.x = this.maze[0].length * this.cellSize / 2 - this.cellSize / 2;
			this.scene.add(floor);
		}

		const mazeCenterX = (this.maze[0].length * this.cellSize) / 2 - this.cellSize / 2;
		const mazeCenterZ = -(this.maze.length * this.cellSize) / 2 + this.cellSize / 2;
		this.camera.position.set(mazeCenterX, 5, this.maze.length);
		this.controls.target.set(mazeCenterX, 0, mazeCenterZ);
		this.controls.update();
	}

	private animate() {
		requestAnimationFrame(() => this.animate());
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}

	public resize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
