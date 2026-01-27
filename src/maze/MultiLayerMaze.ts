import { Maze } from './Maze';
import * as THREE from 'three';

export class MultiLayerMaze extends Maze {
  constructor(
    canvas: HTMLCanvasElement,
    maze: number[][][],
    wallHeight: number = 1,
    wallThickness: number = 0.1,
    cellSize: number = 1
  ) {
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
              mazeLayer.add(
                this.createWall(
                  colIndex * this.cellSize + this.cellSize / 2,
                  layerHeight + this.wallHeight / 2,
                  -rowIndex * this.cellSize,
                  this.cellSize,
                  this.wallHeight,
                  this.wallThickness
                )
              );
            }
            if (rowIndex < layer.length - 1 && layer[rowIndex + 1][colIndex] === 1) {
              mazeLayer.add(
                this.createWall(
                  colIndex * this.cellSize,
                  layerHeight + this.wallHeight / 2,
                  -(rowIndex * this.cellSize + this.cellSize / 2),
                  this.wallThickness,
                  this.wallHeight,
                  this.cellSize
                )
              );
            }
          }
        });
      });

      if (layerIndex > 0) {
        layer.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            if (cell !== 2) {
              const smallFloor = this.createSmallFloor(
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

      if (layerIndex === 0) {
        const floor = this.createFloor(
          layer[0].length * this.cellSize,
          layer.length * this.cellSize,
          (layer[0].length * this.cellSize) / 2 - this.cellSize / 2,
          -this.wallThickness / 2,
          (-layer.length * this.cellSize) / 2 + this.cellSize / 2
        );
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
