import { Maze, MazeConfig } from './Maze';
import * as THREE from 'three';

/**
 * MultiLayerMaze - Maze with multiple stacked layers
 */
export class MultiLayerMaze extends Maze {
  constructor(canvas: HTMLCanvasElement, maze: number[][][], config?: MazeConfig) {
    super(canvas, maze, config);
  }

  protected createMaze(): void {
    this.deleteMaze();

    this.maze.forEach((layer, layerIndex) => {
      const mazeLayer = new THREE.Object3D();
      const layerHeight = layerIndex * this.wallHeight;

      // Create walls for this layer
      this.createWallsForLayer(layer, layerHeight, mazeLayer);

      // Create floors (except for first layer which has main floor)
      if (layerIndex > 0) {
        this.createLayerFloors(layer, layerHeight, mazeLayer);
      } else {
        this.createMainFloor(layer, mazeLayer);
      }

      this.mazeLayers.push(mazeLayer);
      this.scene.add(mazeLayer);
    });

    // Position camera
    this.positionCameraForMultiLayer();
  }

  /**
   * Create walls for a layer
   */
  private createWallsForLayer(
    layer: number[][],
    layerHeight: number,
    mazeLayer: THREE.Object3D
  ): void {
    layer.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          // Horizontal wall
          if (colIndex < row.length - 1 && row[colIndex + 1] === 1) {
            const wall = this.meshFactory.createWall({
              x: colIndex * this.cellSize + this.cellSize / 2,
              y: layerHeight + this.wallHeight / 2,
              z: -rowIndex * this.cellSize,
              width: this.cellSize,
              height: this.wallHeight,
              depth: this.wallThickness,
            });
            mazeLayer.add(wall);
          }

          // Vertical wall
          if (rowIndex < layer.length - 1 && layer[rowIndex + 1][colIndex] === 1) {
            const wall = this.meshFactory.createWall({
              x: colIndex * this.cellSize,
              y: layerHeight + this.wallHeight / 2,
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
   * Create small floors for cells in layer (except cells with value 2)
   */
  private createLayerFloors(
    layer: number[][],
    layerHeight: number,
    mazeLayer: THREE.Object3D
  ): void {
    layer.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        // Cell value 2 = no floor (hole/opening)
        if (cell !== 2) {
          const smallFloor = this.meshFactory.createSmallFloor(
            colIndex * this.cellSize,
            layerHeight,
            -rowIndex * this.cellSize,
            this.cellSize
          );
          mazeLayer.add(smallFloor);
        }
      });
    });
  }

  /**
   * Create main floor (ground floor)
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
   * Position camera for multi-layer maze
   */
  private positionCameraForMultiLayer(): void {
    const firstLayer = this.maze[0];
    const mazeCenterX = (firstLayer[0].length * this.cellSize) / 2 - this.cellSize / 2;
    const mazeCenterZ = -(firstLayer.length * this.cellSize) / 2 + this.cellSize / 2;
    const distance = this.maze.length * this.cellSize;

    this.positionCamera(mazeCenterX, mazeCenterZ, distance);
  }
}
