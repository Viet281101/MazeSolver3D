import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Maze {
	protected canvas: HTMLCanvasElement;
	protected scene: THREE.Scene;
	protected camera: THREE.PerspectiveCamera;
	protected renderer: THREE.WebGLRenderer;
	protected controls: OrbitControls;
	protected maze: number[][][];
	protected wallHeight: number;
	protected wallThickness: number;
	protected cellSize: number;
	protected mazeLayers: THREE.Object3D[];
	protected wallColor: THREE.Color;
	protected floorColor: THREE.Color;
	protected wallOpacity: number;
	protected floorOpacity: number;

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
		this.wallColor = new THREE.Color(0x808080);
		this.floorColor = new THREE.Color(0xC0C0C0);
		this.wallOpacity = 1.0;
		this.floorOpacity = 1.0;

		this.init();
		this.animate();
	}

	protected createWall(x: number, y: number, z: number, width: number, height: number, depth: number) {
		const geometry = new THREE.BoxGeometry(width, height, depth);
		const material = new THREE.MeshBasicMaterial({ color: this.wallColor, transparent: true, opacity: this.wallOpacity });
		const wall = new THREE.Mesh(geometry, material);
		wall.position.set(x, y, z);

		const edges = new THREE.EdgesGeometry(geometry);
		const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
		line.position.set(x, y, z);

		const group = new THREE.Group();
		group.add(wall);
		group.add(line);

		return group;
	}

	protected createFloor(width: number, height: number, x: number, y: number, z: number) {
		const floorGeometry = new THREE.PlaneGeometry(width, height);
		const floorMaterial = new THREE.MeshBasicMaterial({ color: this.floorColor, side: THREE.DoubleSide, transparent: true, opacity: this.floorOpacity });
		const floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -Math.PI / 2;
		floor.position.set(x, y, z);

		const edges = new THREE.EdgesGeometry(floorGeometry);
		const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
		line.rotation.x = -Math.PI / 2;
		line.position.set(x, y, z);

		const group = new THREE.Group();
		group.add(floor);
		group.add(line);

		return group;
	}

	protected init() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);
		this.createMaze();
	}

	protected createMaze() {
		// To be implemented by subclasses
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

	public getRenderer() {
		return this.renderer;
	}

	public updateWallColor(color: string) {
		this.wallColor.set(color);
		this.updateColors();
	}

	public updateFloorColor(color: string) {
		this.floorColor.set(color);
		this.updateColors();
	}

	public updateWallOpacity(opacity: number) {
		this.wallOpacity = opacity;
		this.updateColors();
	}

	public updateFloorOpacity(opacity: number) {
		this.floorOpacity = opacity;
		this.updateColors();
	}

	protected updateColors() {
		this.mazeLayers.forEach(layer => {
			layer.children.forEach((child: THREE.Object3D) => {
				if (child instanceof THREE.Group) {
					child.children.forEach((mesh) => {
						if (mesh instanceof THREE.Mesh) {
							if (mesh.geometry instanceof THREE.PlaneGeometry) {
								(mesh.material as THREE.MeshBasicMaterial).color = this.floorColor;
								(mesh.material as THREE.MeshBasicMaterial).opacity = this.floorOpacity;
							} else if (mesh.geometry instanceof THREE.BoxGeometry) {
								(mesh.material as THREE.MeshBasicMaterial).color = this.wallColor;
								(mesh.material as THREE.MeshBasicMaterial).opacity = this.wallOpacity;
							}
						}
					});
				}
			});
		});
	}
}

export class SingleLayerMaze extends Maze {
	constructor(canvas: HTMLCanvasElement, maze: number[][][], wallHeight: number = 1, wallThickness: number = 0.1, cellSize: number = 1) {
		super(canvas, maze, wallHeight, wallThickness, cellSize);
	}

	protected createMaze() {
		this.deleteMaze();

		const mazeLayer = new THREE.Object3D();

		this.maze[0].forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				if (cell === 1) {
					if (colIndex < row.length - 1 && row[colIndex + 1] === 1) {
						mazeLayer.add(this.createWall(colIndex * this.cellSize + this.cellSize / 2, this.wallHeight / 2, -rowIndex * this.cellSize, this.cellSize, this.wallHeight, this.wallThickness));
					}
					if (rowIndex < this.maze[0].length - 1 && this.maze[0][rowIndex + 1][colIndex] === 1) {
						mazeLayer.add(this.createWall(colIndex * this.cellSize, this.wallHeight / 2, -(rowIndex * this.cellSize + this.cellSize / 2), this.wallThickness, this.wallHeight, this.cellSize));
					}
				}
			});
		});

		const floor = this.createFloor(this.maze[0][0].length * this.cellSize, this.maze[0].length * this.cellSize, 
			this.maze[0][0].length * this.cellSize / 2 - this.cellSize / 2, -this.wallThickness / 2, -this.maze[0].length * this.cellSize / 2 + this.cellSize / 2);
		mazeLayer.add(floor);

		this.mazeLayers.push(mazeLayer);
		this.scene.add(mazeLayer);

		const mazeCenterX = (this.maze[0][0].length * this.cellSize) / 2 - this.cellSize / 2;
		const mazeCenterZ = -(this.maze[0].length * this.cellSize) / 2 + this.cellSize / 2;
		this.camera.position.set(mazeCenterX, 5, this.maze[0].length * this.cellSize);
		this.controls.target.set(mazeCenterX, 0, mazeCenterZ);
		this.controls.update();
	}
}

export class MultiLayerMaze extends Maze {
	constructor(canvas: HTMLCanvasElement, maze: number[][][], wallHeight: number = 1, wallThickness: number = 0.1, cellSize: number = 1) {
		super(canvas, maze, wallHeight, wallThickness, cellSize);
	}

	protected createMaze() {
		this.deleteMaze();

		this.maze.forEach((layer, layerIndex) => {
			const mazeLayer = new THREE.Object3D();
			const layerHeight = layerIndex * this.wallHeight;

			layer.forEach((row, rowIndex) => {
				row.forEach((cell, colIndex) => {
					if (cell === 1) {
						if (colIndex < row.length - 1 && row[colIndex + 1] === 1) {
							mazeLayer.add(this.createWall(colIndex * this.cellSize + this.cellSize / 2, layerHeight + this.wallHeight / 2, -rowIndex * this.cellSize, this.cellSize, this.wallHeight, this.wallThickness));
						}
						if (rowIndex < layer.length - 1 && layer[rowIndex + 1][colIndex] === 1) {
							mazeLayer.add(this.createWall(colIndex * this.cellSize, layerHeight + this.wallHeight / 2, -(rowIndex * this.cellSize + this.cellSize / 2), this.wallThickness, this.wallHeight, this.cellSize));
						}
					}
				});
			});

			if (layerIndex === 0) {
				const floor = this.createFloor(layer[0].length * this.cellSize, layer.length * this.cellSize, 
					layer[0].length * this.cellSize / 2 - this.cellSize / 2, -this.wallThickness / 2, -layer.length * this.cellSize / 2 + this.cellSize / 2);
				mazeLayer.add(floor);
			}

			this.mazeLayers.push(mazeLayer);
			this.scene.add(mazeLayer);
		});

		const mazeCenterX = (this.maze[0][0].length * this.cellSize) / 2 - this.cellSize / 2;
		const mazeCenterZ = -(this.maze[0].length * this.cellSize) / 2 + this.cellSize / 2;
		this.camera.position.set(mazeCenterX, 5, this.maze.length * this.cellSize);
		this.controls.target.set(mazeCenterX, 0, mazeCenterZ);
		this.controls.update();
	}
}
