import './style.css';
import { LayerMaze } from './maze';
import { Toolbar } from './toolbar';
import { GUIController } from './gui';

class MainApp {
  private canvas: HTMLCanvasElement;
  private toolbar: Toolbar;
  private maze: LayerMaze;
  private guiController: GUIController;

  constructor() {
    this.canvas = document.getElementById('mazeCanvas') as HTMLCanvasElement;
    this.toolbar = new Toolbar();
    const initialMaze = [
      [
        [1, 0, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 1],
        [1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1],
      ],
    ];
    this.maze = new LayerMaze(this.canvas, initialMaze);
    this.guiController = new GUIController(this);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private onWindowResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.toolbar.resizeToolbar();
    this.maze.resize();
    this.guiController.checkWindowSize();
  }

  public updateMaze(newMaze: number[][][]) {
    this.maze.deleteMaze();
    this.maze = new LayerMaze(this.canvas, newMaze);
  }

  public getRenderer() {
    return this.maze.getRenderer();
  }

  public updateWallColor(color: string) {
    this.maze.updateWallColor(color);
  }

  public updateFloorColor(color: string) {
    this.maze.updateFloorColor(color);
  }
}

window.onload = () => {
  const app = new MainApp();
  // Example usage of updateMaze
  const newMaze = [
    [
      [1, 0, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 1],
      [1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1],
    ],
    [
      [1, 0, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 1],
      [1, 0, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1],
    ],
  ];
  // app.updateMaze(newMaze);
};
