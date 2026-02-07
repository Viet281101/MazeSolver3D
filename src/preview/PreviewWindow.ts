import './PreviewWindow.css';

export interface PreviewWindowConfig {
  initialX?: number;
  initialY?: number;
  width?: number;
  height?: number;
  title?: string;
}

/**
 * PreviewWindow - Draggable 2D maze preview window
 */
export class PreviewWindow {
  private container: HTMLDivElement;
  private titleBar: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private closeButton: HTMLButtonElement;
  private legend: HTMLDivElement;

  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private windowX: number = 0;
  private windowY: number = 0;

  private width: number;
  private height: number;
  private canvasWidth: number = 256;
  private canvasHeight: number = 256;

  private isVisible: boolean = true;
  private mazeData: number[][] | null = null;

  constructor(config: PreviewWindowConfig = {}) {
    this.width = config.width ?? 300;
    this.height = config.height ?? 320;
    const margin = 20;
    const defaultX = Math.max(margin, window.innerWidth - this.width - margin);
    const defaultY = Math.max(margin, window.innerHeight - this.height - margin);
    this.windowX = config.initialX ?? defaultX;
    this.windowY = config.initialY ?? defaultY;

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'preview-window';
    this.container.style.width = `${this.width}px`;
    this.container.style.height = `${this.height}px`;
    this.container.style.left = `${this.windowX}px`;
    this.container.style.top = `${this.windowY}px`;

    // Create title bar
    this.titleBar = document.createElement('div');
    this.titleBar.className = 'preview-titlebar';
    this.titleBar.textContent = config.title ?? 'Preview';

    // Create close button
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'preview-close-btn';
    this.closeButton.innerHTML = '×';

    // Create legend
    this.legend = document.createElement('div');
    this.legend.className = 'preview-legend';
    this.legend.innerHTML =
      '<span class="preview-legend-item"><i class="preview-swatch wall"></i>Wall</span>' +
      '<span class="preview-legend-item"><i class="preview-swatch path"></i>Path</span>';

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'preview-canvas';
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = context;

    // Assemble window
    this.titleBar.appendChild(this.closeButton);
    this.container.appendChild(this.titleBar);
    this.container.appendChild(this.legend);
    this.container.appendChild(this.canvas);
    document.body.appendChild(this.container);

    // Setup event listeners
    this.setupEventListeners();

    // Initial render
    this.render();
  }

  /**
   * Setup event listeners for dragging and closing
   */
  private setupEventListeners(): void {
    // Close button
    this.closeButton.addEventListener('click', e => {
      e.stopPropagation();
      this.hide();
    });

    // Dragging
    this.titleBar.addEventListener('mousedown', e => this.onMouseDown(e));
    document.addEventListener('mousemove', e => this.onMouseMove(e));
    document.addEventListener('mouseup', () => this.onMouseUp());

    // Prevent text selection while dragging
    this.titleBar.addEventListener('selectstart', e => e.preventDefault());
  }

  /**
   * Mouse down handler - start dragging
   */
  private onMouseDown(e: MouseEvent): void {
    if (e.target === this.closeButton) return;

    this.isDragging = true;
    this.dragStartX = e.clientX - this.windowX;
    this.dragStartY = e.clientY - this.windowY;
    this.container.classList.add('dragging');
  }

  /**
   * Mouse move handler - update position
   */
  private onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    this.windowX = e.clientX - this.dragStartX;
    this.windowY = e.clientY - this.dragStartY;

    // Constrain to window bounds
    this.windowX = Math.max(0, Math.min(this.windowX, window.innerWidth - this.width));
    this.windowY = Math.max(0, Math.min(this.windowY, window.innerHeight - this.height));

    this.container.style.left = `${this.windowX}px`;
    this.container.style.top = `${this.windowY}px`;
  }

  /**
   * Mouse up handler - stop dragging
   */
  private onMouseUp(): void {
    this.isDragging = false;
    this.container.classList.remove('dragging');
  }

  /**
   * Update maze data and redraw
   */
  public updateMaze(mazeData: number[][]): void {
    this.mazeData = mazeData;
    this.render();
  }

  /**
   * Render 2D maze on canvas
   */
  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    if (!this.mazeData || this.mazeData.length === 0) {
      return;
    }

    const rows = this.mazeData.length;
    const cols = this.mazeData[0].length;

    // Calculate cell size to fit canvas
    const cellWidth = this.canvasWidth / cols;
    const cellHeight = this.canvasHeight / rows;
    const cellSize = Math.min(cellWidth, cellHeight);

    // Center the maze
    const offsetX = (this.canvasWidth - cellSize * cols) / 2;
    const offsetY = (this.canvasHeight - cellSize * rows) / 2;

    // Draw cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * cellSize;
        const y = offsetY + (rows - 1 - row) * cellSize;

        if (this.mazeData[row][col] === 1) {
          // Wall - dark gray
          this.ctx.fillStyle = '#808080';
        } else {
          // Path - light gray
          this.ctx.fillStyle = '#c0c0c0';
        }

        this.ctx.fillRect(x, y, cellSize, cellSize);

        // Draw grid lines
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }

  /**
   * Show the preview window
   */
  public show(): void {
    this.isVisible = true;
    this.container.style.display = 'block';
  }

  /**
   * Hide the preview window
   */
  public hide(): void {
    this.isVisible = false;
    this.container.style.display = 'none';
  }

  /**
   * Toggle visibility
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if window is visible
   */
  public isWindowVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Re-clamp window position on viewport resize
   */
  public handleWindowResize(): void {
    const maxX = Math.max(0, window.innerWidth - this.width);
    const maxY = Math.max(0, window.innerHeight - this.height);

    this.windowX = Math.max(0, Math.min(this.windowX, maxX));
    this.windowY = Math.max(0, Math.min(this.windowY, maxY));

    this.container.style.left = `${this.windowX}px`;
    this.container.style.top = `${this.windowY}px`;
  }

  /**
   * Destroy the preview window
   */
  public destroy(): void {
    this.container.remove();
  }
}
