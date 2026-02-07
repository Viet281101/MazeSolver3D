import * as dat from 'dat.gui';
import { MazeController } from './maze/MazeController';

export interface GUISettings {
  backgroundColor: string;
  wallColor: string;
  floorColor: string;
  wallOpacity: number;
  floorOpacity: number;
  showEdges: boolean;
  showDebug: boolean;
  showPreview: boolean;
}

interface GUIConfig {
  scale?: number;
  mobileBreakpoint?: number;
  autoHide?: boolean;
}

/**
 * GUIController - Manage dat.GUI interface
 * Responsive & auto hide on mobile
 */
export class GUIController {
  private gui: dat.GUI;
  public settings: GUISettings;
  private mazeController: MazeController;

  // Configuration
  private readonly mobileBreakpoint: number;
  private readonly guiScale: number;
  private readonly autoHide: boolean;

  // Controllers - Fixed type
  private controllers: Map<string, any> = new Map();

  constructor(mazeController: MazeController, config: GUIConfig = {}) {
    this.mazeController = mazeController;

    // Apply config with defaults
    this.mobileBreakpoint = config.mobileBreakpoint ?? 800;
    this.guiScale = config.scale ?? 1.4;
    this.autoHide = config.autoHide ?? true;

    // Default settings
    this.settings = {
      backgroundColor: '#999999',
      wallColor: '#808080',
      floorColor: '#C0C0C0',
      wallOpacity: 1.0,
      floorOpacity: 1.0,
      showEdges: true,
      showDebug: true,
      showPreview: true,
    };

    this.gui = new dat.GUI();
    this.initializeGUI();

    if (this.autoHide) {
      this.setupResponsiveness();
    }
  }

  /**
   * Initialize GUI controls
   */
  private initializeGUI(): void {
    this.styleGUIContainer();
    this.addColorControls();
    this.addOpacityControls();
    this.addEdgeControl();
    this.addDebugControl();
    this.addPreviewControl();
  }

  /**
   * Style GUI container
   */
  private styleGUIContainer(): void {
    const guiContainer = this.gui.domElement.parentElement;
    if (!guiContainer) return;

    guiContainer.classList.add('scaled-gui');
    Object.assign(guiContainer.style, {
      zIndex: '1000',
      right: '-20px',
      transformOrigin: 'top right',
      transform: `scale(${this.guiScale})`,
    });
  }

  /**
   * Add color controls
   */
  private addColorControls(): void {
    // Background color
    const bgController = this.gui.addColor(this.settings, 'backgroundColor');
    bgController.onChange((value: string) => {
      const renderer = this.mazeController.getRenderer();
      if (renderer) {
        renderer.setClearColor(value);
        this.mazeController.requestRender();
      }
    });
    this.controllers.set('backgroundColor', bgController);

    // Wall color
    const wallColorController = this.gui.addColor(this.settings, 'wallColor');
    wallColorController.onChange((value: string) => {
      this.mazeController.updateWallColor(value);
    });
    this.controllers.set('wallColor', wallColorController);

    // Floor color
    const floorColorController = this.gui.addColor(this.settings, 'floorColor');
    floorColorController.onChange((value: string) => {
      this.mazeController.updateFloorColor(value);
    });
    this.controllers.set('floorColor', floorColorController);
  }

  /**
   * Add opacity controls
   */
  private addOpacityControls(): void {
    // Wall opacity
    const wallOpacityController = this.gui.add(this.settings, 'wallOpacity', 0, 1, 0.01);
    wallOpacityController.onChange((value: number) => {
      this.mazeController.updateWallOpacity(value);
    });
    this.controllers.set('wallOpacity', wallOpacityController);

    // Floor opacity
    const floorOpacityController = this.gui.add(this.settings, 'floorOpacity', 0, 1, 0.01);
    floorOpacityController.onChange((value: number) => {
      this.mazeController.updateFloorOpacity(value);
    });
    this.controllers.set('floorOpacity', floorOpacityController);
  }

  /**
   * Add edge toggle control
   */
  private addEdgeControl(): void {
    const edgeController = this.gui.add(this.settings, 'showEdges');
    edgeController.onChange((value: boolean) => {
      this.mazeController.toggleEdges(value);
    });
    this.controllers.set('showEdges', edgeController);
  }

  /**
   * Add debug overlay toggle
   */
  private addDebugControl(): void {
    const debugController = this.gui.add(this.settings, 'showDebug');
    debugController.onChange((value: boolean) => {
      this.mazeController.setDebugOverlayVisible(value);
    });
    this.controllers.set('showDebug', debugController);
  }

  /**
   * Add preview window toggle
   */
  private addPreviewControl(): void {
    const previewController = this.gui.add(this.settings, 'showPreview');
    previewController.onChange((value: boolean) => {
      this.mazeController.setPreviewVisible(value);
    });
    this.controllers.set('showPreview', previewController);
  }

  /**
   * Setup responsive behavior
   */
  private setupResponsiveness(): void {
    this.updateGUIVisibility();
    window.addEventListener('resize', () => this.updateGUIVisibility());
  }

  /**
   * Update GUI visibility based on window size
   */
  private updateGUIVisibility(): void {
    if (!this.gui.domElement) return;

    const isVisible = window.innerWidth > this.mobileBreakpoint;
    this.gui.domElement.style.display = isVisible ? 'block' : 'none';
  }

  /**
   * Public method to check window size
   */
  public checkWindowSize(): void {
    if (this.autoHide) {
      this.updateGUIVisibility();
    }
  }

  /**
   * Update 1 setting programmatically
   */
  public updateSetting<K extends keyof GUISettings>(key: K, value: GUISettings[K]): void {
    this.settings[key] = value;

    const controller = this.controllers.get(key);
    if (controller && controller.updateDisplay) {
      controller.updateDisplay();
    }
  }

  /**
   * Show/hide GUI
   */
  public setVisible(visible: boolean): void {
    if (this.gui.domElement) {
      this.gui.domElement.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Destroy GUI
   */
  public destroy(): void {
    // Clear controllers map
    this.controllers.clear();

    // Remove GUI from DOM
    if (this.gui && this.gui.domElement) {
      const guiContainer = this.gui.domElement.parentElement;
      if (guiContainer && guiContainer.parentElement) {
        guiContainer.parentElement.removeChild(guiContainer);
      }
    }
  }
}
