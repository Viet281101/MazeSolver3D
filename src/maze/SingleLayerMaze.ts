import { Maze } from './Maze';
import * as THREE from 'three';

export class SingleLayerMaze extends Maze {
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

    const maze = new THREE.Object3D();

    this.maze[0].forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          if (colIndex < row.length - 1 && row[colIndex + 1] === 1) {
            maze.add(
              this.createWall(
                colIndex * this.cellSize + this.cellSize / 2,
                this.wallHeight / 2,
                -rowIndex * this.cellSize,
                this.cellSize,
                this.wallHeight,
                this.wallThickness
              )
            );
          }
          if (rowIndex < this.maze[0].length - 1 && this.maze[0][rowIndex + 1][colIndex] === 1) {
            maze.add(
              this.createWall(
                colIndex * this.cellSize,
                this.wallHeight / 2,
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

    const floor = this.createFloor(
      this.maze[0][0].length * this.cellSize,
      this.maze[0].length * this.cellSize,
      (this.maze[0][0].length * this.cellSize) / 2 - this.cellSize / 2,
      -this.wallThickness / 2,
      (-this.maze[0].length * this.cellSize) / 2 + this.cellSize / 2
    );
    maze.add(floor);

    this.mazeLayers.push(maze);
    this.scene.add(maze);

    const mazeCenterX = (this.maze[0][0].length * this.cellSize) / 2 - this.cellSize / 2;
    const mazeCenterZ = -(this.maze[0].length * this.cellSize) / 2 + this.cellSize / 2;
    this.camera.position.set(mazeCenterX, 5, this.maze[0].length * this.cellSize);
    this.controls.target.set(mazeCenterX, 0, mazeCenterZ);
    this.controls.update();
  }
}
