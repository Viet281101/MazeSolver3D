import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Maze {
	private canvas: HTMLCanvasElement;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private controls: OrbitControls;
	private maze: number[][][];
	private wallHeight: number;
	private wallThickness: number;
	private cellSize: number;
	private mazeLayers: THREE.Object3D[];

	constructor(canvas: HTMLCanvasElement, maze: number[][][], wallHeight: number = 1, wallThickness: number = 0.1, cellSize: number = 1) {
		this.canvas = canvas;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.maze = maze;
		this.wallHeight = wallHeight;
		this.wallThickness = wallThickness;
		this.cellSize = cellSize;
		this.mazeLayers = [];

		this.init();
		this.animate();
	}

	private createWall(x: number, y: number, z: number, width: number, height: number, depth: number) {
		const geometry = new THREE.BoxGeometry(width, height, depth);
		const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
		const wall = new THREE.Mesh(geometry, material);
		wall.position.set(x, y, z);
		return wall;
	}

	private init() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);
		this.createMaze();
	}

	private createMaze() {
		this.deleteMaze();

		this.maze.forEach((layer, layerIndex) => {
			const mazeLayer = new THREE.Object3D();
			layer.forEach((row, rowIndex) => {
				row.forEach((cell, colIndex) => {
					if (cell === 1) {
						if (colIndex < row.length - 1 && row[colIndex + 1] === 1) {
							mazeLayer.add(this.createWall(colIndex * this.cellSize + this.cellSize / 2, this.wallHeight / 2 + layerIndex * (this.wallHeight + 0.5), -rowIndex * this.cellSize, this.cellSize, this.wallHeight, this.wallThickness));
						}
						if (rowIndex < layer.length - 1 && layer[rowIndex + 1][colIndex] === 1) {
							mazeLayer.add(this.createWall(colIndex * this.cellSize, this.wallHeight / 2 + layerIndex * (this.wallHeight + 0.5), -(rowIndex * this.cellSize + this.cellSize / 2), this.wallThickness, this.wallHeight, this.cellSize));
						}
					}
				});
			});

			const floorGeometry = new THREE.PlaneGeometry(layer[0].length * this.cellSize, layer.length * this.cellSize);
			const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xC0C0C0, side: THREE.DoubleSide });
			const floor = new THREE.Mesh(floorGeometry, floorMaterial);
			floor.rotation.x = -Math.PI / 2;
			floor.position.y = -this.wallThickness / 2 + layerIndex * (this.wallHeight + 0.5);
			floor.position.z = -layer.length * this.cellSize / 2 + this.cellSize / 2;
			floor.position.x = layer[0].length * this.cellSize / 2 - this.cellSize / 2;
			mazeLayer.add(floor);

			this.mazeLayers.push(mazeLayer);
			this.scene.add(mazeLayer);
		});

		const mazeCenterX = (this.maze[0][0].length * this.cellSize) / 2 - this.cellSize / 2;
		const mazeCenterZ = -(this.maze[0].length * this.cellSize) / 2 + this.cellSize / 2;
		this.camera.position.set(mazeCenterX, 5, this.maze.length * this.cellSize);
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

	public deleteMaze() {
		this.mazeLayers.forEach(layer => {
			this.scene.remove(layer);
		});
		this.mazeLayers = [];
	}
}
