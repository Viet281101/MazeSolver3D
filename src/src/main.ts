import './style.css';
import { SingleLayerMaze } from './maze/SingleLayerMaze';
import { MultiLayerMaze } from './maze/MultiLayerMaze';
import { Toolbar } from './sidebar/toolbar';
import { GUIController } from './gui';
import { PreviewWindow } from './preview/PreviewWindow';

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
  requestRender(): void;
  setDebugOverlayVisible(visible: boolean): void;
  setPreviewVisible(visible: boolean): void;
}

/**
 * MainApp - Application entry point & lifecycle manager
 */
class MainApp implements MazeController {
  private canvas: HTMLCanvasElement;
  private toolbar: Toolbar;
  private maze: SingleLayerMaze | MultiLayerMaze;
  private guiController: GUIController;
  private previewWindow: PreviewWindow;
  private resizeHandler: () => void;
  private debugOverlay: HTMLDivElement | null = null;
  private debugIntervalId: number | null = null;
  private debugStartTime: number = 0;
  private renderCount: number = 0;
  private renderListener: () => void;
  private isDebugOverlayVisible: boolean = true;
  private isPreviewVisible: boolean = true;

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

    // Initialize preview window
    this.previewWindow = new PreviewWindow({
      title: 'Preview',
      width: 300,
      height: 320,
    });

    // Initialize debug overlay
    this.renderListener = () => {
      this.renderCount += 1;
    };
    this.maze.addRenderListener(this.renderListener);
    this.setupDebugOverlay();
    this.setDebugOverlayVisible(this.isDebugOverlayVisible);
    this.setPreviewVisible(this.isPreviewVisible);

    // Set initial background color
    this.getRenderer().setClearColor(this.guiController.settings.backgroundColor);

    // Update preview with initial maze
    this.updatePreview();

    // Setup event listeners
    this.resizeHandler = () => this.onWindowResize();
    window.addEventListener('resize', this.resizeHandler);

    // Add keyboard shortcut to toggle preview (P key)
    window.addEventListener('keydown', e => {
      if (e.key === 'p' || e.key === 'P') {
        this.previewWindow.toggle();
      }
    });
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
    this.toolbar.resizeToolbar();
    this.maze.resize();
    this.guiController.checkWindowSize();
  }

  /**
   * Update maze with new data
   */
  public updateMaze(newMaze: number[][][], multiLayer: boolean = false): void {
    // Destroy old maze completely
    this.maze.removeRenderListener(this.renderListener);
    this.maze.destroy();

    // Create new maze
    if (multiLayer) {
      this.maze = new MultiLayerMaze(this.canvas, newMaze);
    } else {
      this.maze = new SingleLayerMaze(this.canvas, newMaze);
    }

    // Apply GUI settings to new maze
    this.applyGUISettings();

    // Re-attach render listener for debug overlay
    this.maze.addRenderListener(this.renderListener);

    // Update preview
    this.updatePreview();
  }

  /**
   * Update preview window with current maze data
   */
  private updatePreview(): void {
    // Get first layer of maze for 2D preview
    const mazeData = this.maze['maze'];
    if (mazeData && mazeData.length > 0) {
      this.previewWindow.updateMaze(mazeData[0]);
    }
  }

  /**
   * Apply current GUI settings to maze
   */
  private applyGUISettings(): void {
    const renderer = this.getRenderer();
    if (renderer) {
      renderer.setClearColor(this.guiController.settings.backgroundColor);
      this.requestRender();
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

  /**
   * Toggle preview window visibility
   */
  public togglePreview(): void {
    this.previewWindow.toggle();
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

  public requestRender(): void {
    this.maze.requestRender();
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
    this.previewWindow.destroy();

    if (this.debugIntervalId !== null) {
      window.clearInterval(this.debugIntervalId);
      this.debugIntervalId = null;
    }
    if (this.debugOverlay && this.debugOverlay.parentNode) {
      this.debugOverlay.parentNode.removeChild(this.debugOverlay);
    }
  }

  public setDebugOverlayVisible(visible: boolean): void {
    this.isDebugOverlayVisible = visible;
    if (this.debugOverlay) {
      this.debugOverlay.style.display = visible ? 'block' : 'none';
    }
  }

  public setPreviewVisible(visible: boolean): void {
    this.isPreviewVisible = visible;
    if (visible) {
      this.previewWindow.show();
    } else {
      this.previewWindow.hide();
    }
  }

  private setupDebugOverlay(): void {
    this.debugStartTime = performance.now();
    this.renderCount = 0;

    const overlay = document.createElement('div');
    overlay.id = 'debug-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '8px',
      left: '58px',
      padding: '6px 8px',
      background: 'rgba(0, 0, 0, 0.6)',
      color: '#e6e6e6',
      fontFamily: 'monospace',
      fontSize: '12px',
      borderRadius: '4px',
      zIndex: '2000',
      pointerEvents: 'none',
      whiteSpace: 'pre',
    });
    document.body.appendChild(overlay);
    this.debugOverlay = overlay;

    let lastUpdate = performance.now();
    let lastRenderCount = 0;

    this.debugIntervalId = window.setInterval(() => {
      const now = performance.now();
      const elapsed = (now - this.debugStartTime) / 1000;
      const interval = (now - lastUpdate) / 1000;
      const renders = this.renderCount - lastRenderCount;
      const fps = interval > 0 ? renders / interval : 0;

      if (this.debugOverlay) {
        this.debugOverlay.textContent = `FPS: ${fps.toFixed(1)}\nRuntime: ${this.formatRuntime(elapsed)}`;
      }

      lastUpdate = now;
      lastRenderCount = this.renderCount;
    }, 500);
  }

  private formatRuntime(secondsTotal: number): string {
    const totalSeconds = Math.floor(secondsTotal);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
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
