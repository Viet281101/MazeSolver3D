import './style.css';
import { SingleLayerMaze, MultiLayerMaze } from './maze';
import { randomizedDepthFirst, randomizedPrims } from './generator';
import { Toolbar } from './toolbar';
import { GUIController } from './gui';

class MainApp {
  private canvas: HTMLCanvasElement;
  private toolbar: Toolbar;
  private maze: SingleLayerMaze | MultiLayerMaze;
  private guiController: GUIController;

  constructor() {
    this.canvas = document.getElementById('mazeCanvas') as HTMLCanvasElement;
    this.toolbar = new Toolbar();
    const initialMaze = [
      [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
    ];
    this.maze = new SingleLayerMaze(this.canvas, initialMaze);
    this.guiController = new GUIController(this);
    this.getRenderer().setClearColor(this.guiController.settings.backgroundColor);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private onWindowResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.toolbar.resizeToolbar();
    this.maze.resize();
    this.guiController.checkWindowSize();
  }

  public updateMaze(newMaze: number[][][], multiLayer: boolean = false) {
    this.maze.deleteMaze();
    if (multiLayer) {
      this.maze = new MultiLayerMaze(this.canvas, newMaze);
    } else {
      this.maze = new SingleLayerMaze(this.canvas, newMaze);
    }
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

  public updateWallOpacity(opacity: number) {
    this.maze.updateWallOpacity(opacity);
  }

  public updateFloorOpacity(opacity: number) {
    this.maze.updateFloorOpacity(opacity);
  }

  public toggleEdges(showEdges: boolean) {
    this.maze.toggleEdges(showEdges);
  }

  public generateMaze() {
    const rdfMaze = randomizedDepthFirst(12, 13);
    const randomPrimsMaze = randomizedPrims(20, 20);
    this.updateMaze([randomPrimsMaze], true);
  }

  createMultiLayerMaze() {
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
    this.updateMaze(newMaze, true);
  }
}

window.onload = () => {
  const app = new MainApp();
  // app.generateMaze();
  // app.createMultiLayerMaze();
};
