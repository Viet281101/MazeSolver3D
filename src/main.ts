import './style.css';
import { SingleLayerMaze } from './maze/SingleLayerMaze';
import { MultiLayerMaze } from './maze/MultiLayerMaze';
import { Toolbar } from './sidebar/toolbar';
import { GUIController } from './gui';

/**
 * Interface for MazeController
 */
export interface MazeController {
  getRenderer(): any;
  updateWallColor(color: string): void;
  updateFloorColor(color: string): void;
  updateWallOpacity(opacity: number): void;
  updateFloorOpacity(opacity: number): void;
  toggleEdges(showEdges: boolean): void;
}

/**
 * MainApp - Application entry point & lifecycle manager
 */
class MainApp implements MazeController {
  private canvas: HTMLCanvasElement;
  private toolbar: Toolbar;
  private maze: SingleLayerMaze | MultiLayerMaze;
  private guiController: GUIController;
  private resizeHandler: () => void;

  constructor() {
    // Get canvas element
    this.canvas = document.getElementById('mazeCanvas') as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error('Canvas element "mazeCanvas" not found');
    }

    // Initialize toolbar
    this.toolbar = new Toolbar();

    // Create initial maze
    this.maze = this.createInitialMaze();

    // Initialize GUI
    this.guiController = new GUIController(this, {
      scale: 1.4,
      mobileBreakpoint: 800,
      autoHide: true,
    });

    // Set initial background color
    this.getRenderer().setClearColor(this.guiController.settings.backgroundColor);

    // Setup event listeners
    this.resizeHandler = () => this.onWindowResize();
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Create initial maze configuration
   */
  private createInitialMaze(): SingleLayerMaze {
    const initialMazeData = [
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

    return new SingleLayerMaze(this.canvas, initialMazeData);
  }

  /**
   * Handle window resize
   */
  private onWindowResize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.toolbar.resizeToolbar();
    this.maze.resize();
    this.guiController.checkWindowSize();
  }

  /**
   * Update maze with new data
   */
  public updateMaze(newMaze: number[][][], multiLayer: boolean = false): void {
    // Destroy old maze completely
    this.maze.destroy();

    // Create new maze
    if (multiLayer) {
      this.maze = new MultiLayerMaze(this.canvas, newMaze);
    } else {
      this.maze = new SingleLayerMaze(this.canvas, newMaze);
    }

    // Apply GUI settings to new maze
    this.applyGUISettings();
  }

  /**
   * Apply current GUI settings to maze
   */
  private applyGUISettings(): void {
    const renderer = this.getRenderer();
    if (renderer) {
      renderer.setClearColor(this.guiController.settings.backgroundColor);
    }
  }

  /**
   * Create multi-layer maze example
   */
  public createMultiLayerMaze(): void {
    const multiLayerData = [
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

    this.updateMaze(multiLayerData, true);
  }

  /**
   * Create single-layer maze example
   */
  public createSingleLayerMaze(): void {
    const singleLayerData = [
      [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ],
    ];

    this.updateMaze(singleLayerData, false);
  }

  // ========== MazeController Interface Implementation ==========

  public getRenderer(): any {
    return this.maze.getRenderer();
  }

  public updateWallColor(color: string): void {
    this.maze.updateWallColor(color);
  }

  public updateFloorColor(color: string): void {
    this.maze.updateFloorColor(color);
  }

  public updateWallOpacity(opacity: number): void {
    this.maze.updateWallOpacity(opacity);
  }

  public updateFloorOpacity(opacity: number): void {
    this.maze.updateFloorOpacity(opacity);
  }

  public toggleEdges(showEdges: boolean): void {
    this.maze.toggleEdges(showEdges);
  }

  /**
   * Cleanup app on destroyed
   */
  public destroy(): void {
    // Remove event listeners
    window.removeEventListener('resize', this.resizeHandler);

    // Destroy components
    this.maze.destroy();
    this.guiController.destroy();
  }
}

// ========== Application Entry Point ==========

let app: MainApp | null = null;

window.onload = () => {
  try {
    app = new MainApp();
    // app.createMultiLayerMaze();
    (window as any).mazeApp = app;
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
};

// Cleanup while closing page
window.onbeforeunload = () => {
  if (app) {
    app.destroy();
    app = null;
  }
};
