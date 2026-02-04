import { Maze, MazeConfig } from './Maze';
import * as THREE from 'three';

/**
 * SingleLayerMaze - Maze with a single layer
 */
export class SingleLayerMaze extends Maze {
  constructor(canvas: HTMLCanvasElement, maze: number[][][], config?: MazeConfig) {
    super(canvas, maze, config);
  }

  protected createMaze(): void {
    this.deleteMaze();

    const mazeLayer = new THREE.Object3D();
    const layer = this.maze[0];

    // Create walls
    this.createWalls(layer, mazeLayer);

    // Create main floor
    this.createMainFloor(layer, mazeLayer);

    // Add to scene
    this.mazeLayers.push(mazeLayer);
    this.scene.add(mazeLayer);

    // Position camera
    this.positionCameraForMaze(layer);
  }

  /**
   * Create walls for layer
   */
  private createWalls(layer: number[][], mazeLayer: THREE.Object3D): void {
    layer.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          // Horizontal wall (connects to right cell)
          if (colIndex < row.length - 1 && row[colIndex + 1] === 1) {
            const wall = this.meshFactory.createWall({
              x: colIndex * this.cellSize + this.cellSize / 2,
              y: this.wallHeight / 2,
              z: -rowIndex * this.cellSize,
              width: this.cellSize,
              height: this.wallHeight,
              depth: this.wallThickness,
            });
            mazeLayer.add(wall);
          }

          // Vertical wall (connects to bottom cell)
          if (rowIndex < layer.length - 1 && layer[rowIndex + 1][colIndex] === 1) {
            const wall = this.meshFactory.createWall({
              x: colIndex * this.cellSize,
              y: this.wallHeight / 2,
              z: -(rowIndex * this.cellSize + this.cellSize / 2),
              width: this.wallThickness,
              height: this.wallHeight,
              depth: this.cellSize,
            });
            mazeLayer.add(wall);
          }
        }
      });
    });
  }

  /**
   * Create main floor
   */
  private createMainFloor(layer: number[][], mazeLayer: THREE.Object3D): void {
    const floorWidth = layer[0].length * this.cellSize;
    const floorHeight = layer.length * this.cellSize;

    const floor = this.meshFactory.createFloor({
      x: floorWidth / 2 - this.cellSize / 2,
      y: -this.wallThickness / 2,
      z: -(floorHeight / 2) + this.cellSize / 2,
      width: floorWidth,
      height: floorHeight,
    });

    mazeLayer.add(floor);
  }

  /**
   * Position camera to view entire maze
   */
  private positionCameraForMaze(layer: number[][]): void {
    const mazeCenterX = (layer[0].length * this.cellSize) / 2 - this.cellSize / 2;
    const mazeCenterZ = -(layer.length * this.cellSize) / 2 + this.cellSize / 2;
    const distance = layer.length * this.cellSize;

    this.positionCamera(mazeCenterX, mazeCenterZ, distance);
  }
}
