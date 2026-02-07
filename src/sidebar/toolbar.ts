import { showSolvePopup } from './popup/solve';
import { showSettingsPopup } from './popup/setting';
import { showTutorialPopup } from './popup/tutorial';
import { showMazePopup } from './popup/maze';
import './toolbar.css';

interface ToolButton {
  name: string;
  icon: string;
  action: () => void;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: HTMLImageElement;
}

export class Toolbar {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isMobile: boolean;
  private buttons: ToolButton[];
  private popupOpen: boolean;
  private currentPopup: HTMLElement | null;
  private currentCloseIcon: HTMLImageElement | null;

  private mouseMoveHandler!: (e: MouseEvent) => void;
  private mouseDownHandler!: (e: MouseEvent | TouchEvent) => void;
  private touchStartHandler!: (e: TouchEvent) => void;
  private documentClickHandler!: (e: MouseEvent | TouchEvent) => void;

  private imageCache: Map<string, HTMLImageElement> = new Map();
  private imagesLoaded: boolean = false;

  constructor() {
    this.isMobile = this.checkIfMobile();
    this.setupCanvas();
    this.buttons = this.createButtons();
    this.popupOpen = false;
    this.currentPopup = null;
    this.currentCloseIcon = null;

    this.preloadImages().then(() => {
      this.imagesLoaded = true;
      this.drawToolbar();
    });

    this.addEventListeners();
  }

  private checkIfMobile(): boolean {
    return window.innerWidth <= 800;
  }

  private setupCanvas(): void {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d', {
        alpha: false,
      }) as CanvasRenderingContext2D;
      this.canvas.className = 'toolbar-canvas';
    }

    if (!this.canvas.parentNode) {
      document.body.appendChild(this.canvas);
    }

    this.canvas.width = this.isMobile ? window.innerWidth : 50;
    this.canvas.height = this.isMobile ? 50 : window.innerHeight;
  }

  private createButtons(): ToolButton[] {
    const iconPaths = [
      '/MazeSolver3D/icon/maze.png',
      '/MazeSolver3D/icon/solving.png',
      '/MazeSolver3D/icon/question.png',
      '/MazeSolver3D/icon/setting.png',
    ];

    return [
      {
        name: 'Custom Maze',
        icon: iconPaths[0],
        action: () => this.togglePopup('maze'),
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      {
        name: 'Solving Maze',
        icon: iconPaths[1],
        action: () => this.togglePopup('solve'),
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      {
        name: 'Tutorial',
        icon: iconPaths[2],
        action: () => this.togglePopup('tutorial'),
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      {
        name: 'Settings',
        icon: iconPaths[3],
        action: () => this.togglePopup('settings'),
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    ];
  }

  private async preloadImages(): Promise<void> {
    const loadPromises = this.buttons.map(button => {
      return new Promise<void>((resolve, reject) => {
        if (this.imageCache.has(button.icon)) {
          button.image = this.imageCache.get(button.icon);
          resolve();
          return;
        }

        const img = new Image();
        img.onload = () => {
          this.imageCache.set(button.icon, img);
          button.image = img;
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load icon: ${button.icon}`);
          reject(new Error(`Failed to load ${button.icon}`));
        };
        img.src = button.icon;
      });
    });

    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.error('Error loading toolbar icons:', error);
    }
  }

  private drawToolbar(): void {
    if (!this.imagesLoaded) return;

    // Clear canvas
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw buttons
    if (this.isMobile) {
      this.drawToolbarVertical();
    } else {
      this.drawToolbarHorizontal();
    }
  }

  private drawToolbarVertical(): void {
    const buttonSize = 36;
    const padding = 5;
    const spacing = 60;
    const totalWidth = this.buttons.length * spacing;
    let startX = (this.canvas.width - totalWidth) / 2;

    this.buttons.forEach(button => {
      if (button.image) {
        // Draw image
        this.ctx.drawImage(button.image, startX - 2, 8, buttonSize, buttonSize);

        // Draw border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(startX - padding, padding, buttonSize + 4, buttonSize + 4);

        // Update button bounds
        button.x = startX - padding;
        button.y = padding;
        button.width = buttonSize + 4;
        button.height = buttonSize + 4;
      }

      startX += spacing;
    });
  }

  private drawToolbarHorizontal(): void {
    const buttonSize = 36;
    const padding = 5;
    const spacing = 60;
    const totalHeight = this.buttons.length * spacing;
    let startY = (this.canvas.height - totalHeight) / 2;

    this.buttons.forEach(button => {
      if (button.image) {
        // Draw image
        this.ctx.drawImage(button.image, 8, startY - 2, buttonSize, buttonSize);

        // Draw border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(padding, startY - padding, buttonSize + 4, buttonSize + 4);

        // Update button bounds
        button.x = padding;
        button.y = startY - padding;
        button.width = buttonSize + 4;
        button.height = buttonSize + 4;
      }

      startY += spacing;
    });
  }

  private addEventListeners(): void {
    this.removeEventListeners();

    this.mouseMoveHandler = (e: MouseEvent) => {
      let cursor = 'default';
      for (const button of this.buttons) {
        if (this.isInside(e.clientX, e.clientY, button)) {
          cursor = 'pointer';
          break;
        }
      }
      this.canvas.style.cursor = cursor;
    };
    this.canvas.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });

    this.mouseDownHandler = (e: MouseEvent | TouchEvent) => this.handleCanvasClick(e);
    this.touchStartHandler = (e: TouchEvent) => this.handleCanvasClick(e);

    this.canvas.addEventListener('mousedown', this.mouseDownHandler);
    this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: true });

    this.documentClickHandler = (e: MouseEvent | TouchEvent) => this.handleDocumentClick(e);
    document.addEventListener('click', this.documentClickHandler, { passive: true });
    document.addEventListener('touchstart', this.documentClickHandler, { passive: true });
  }

  private removeEventListeners(): void {
    if (this.mouseMoveHandler) {
      this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.mouseDownHandler) {
      this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
    }
    if (this.touchStartHandler) {
      this.canvas.removeEventListener('touchstart', this.touchStartHandler);
    }
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
      document.removeEventListener('touchstart', this.documentClickHandler);
    }
  }

  private handleCanvasClick(e: MouseEvent | TouchEvent): void {
    const mouseX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const mouseY = 'clientY' in e ? e.clientY : e.touches[0].clientY;

    for (const button of this.buttons) {
      if (this.isInside(mouseX, mouseY, button)) {
        button.action();
        break;
      }
    }
  }

  private handleDocumentClick(e: MouseEvent | TouchEvent): void {
    if (!this.popupOpen) return;

    const target = e.target as Node;
    if (this.canvas.contains(target)) return;

    const popups = ['solvePopup', 'tutorialPopup', 'settingsPopup', 'mazePopup'];
    for (const popupId of popups) {
      const popup = document.getElementById(popupId);
      if (popup && !popup.contains(target)) {
        this.closeCurrentPopup();
        break;
      }
    }
  }

  public resizeToolbar(): void {
    const wasMobile = this.isMobile;
    this.isMobile = this.checkIfMobile();

    if (wasMobile !== this.isMobile) {
      this.removeEventListeners();
      this.removeCanvas();
      this.setupCanvas();
      this.addEventListeners();
    } else {
      this.canvas.width = this.isMobile ? window.innerWidth : 50;
      this.canvas.height = this.isMobile ? 50 : window.innerHeight;
    }

    this.drawToolbar();
  }

  private removeCanvas(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  private isInside(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  private togglePopup(type: string): void {
    if (this.currentPopup && this.currentPopup.id === `${type}Popup`) {
      this.closePopup(type);
    } else {
      this.closeCurrentPopup();
      this.showPopup(type);
    }
  }

  private showPopup(type: string): void {
    this.popupOpen = true;
    switch (type) {
      case 'solve':
        showSolvePopup(this);
        break;
      case 'tutorial':
        showTutorialPopup(this);
        break;
      case 'settings':
        showSettingsPopup(this);
        break;
      case 'maze':
        showMazePopup(this);
        break;
    }
  }

  public createPopupContainer(id: string, title: string): HTMLElement {
    const popupContainer = document.createElement('div');
    popupContainer.id = id;
    popupContainer.className = 'toolbar-popup';
    popupContainer.style.setProperty('--toolbar-popup-top', this.isMobile ? '50px' : '0');
    popupContainer.style.setProperty('--toolbar-popup-left', this.isMobile ? '50%' : '238px');
    document.body.appendChild(popupContainer);

    const popup = document.createElement('canvas');
    popup.width = 370;
    popup.height = 4000;
    popupContainer.appendChild(popup);

    const titleElement = document.createElement('h3');
    titleElement.className = 'toolbar-popup__title';
    titleElement.textContent = title;
    popupContainer.appendChild(titleElement);

    this.addCloseIcon();
    this.currentPopup = popupContainer;
    return popupContainer;
  }

  private addCloseIcon(): void {
    if (this.currentCloseIcon) {
      document.body.removeChild(this.currentCloseIcon);
    }

    const closeIcon = new Image();
    closeIcon.src = '/MazeSolver3D/icon/close.png';
    closeIcon.className = 'toolbar-popup__close';
    closeIcon.style.setProperty('--toolbar-close-top', this.isMobile ? '56px' : '10px');
    closeIcon.style.setProperty(
      '--toolbar-close-left',
      this.isMobile ? 'calc(50% + 162px)' : '400px'
    );
    closeIcon.addEventListener('click', () => this.closeCurrentPopup());
    document.body.appendChild(closeIcon);
    this.currentCloseIcon = closeIcon;
  }

  public closePopup(type: string): void {
    const popup = document.getElementById(`${type}Popup`);
    if (popup && popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
    if (this.currentCloseIcon && this.currentCloseIcon.parentNode) {
      this.currentCloseIcon.parentNode.removeChild(this.currentCloseIcon);
      this.currentCloseIcon = null;
    }
    const inputs = document.querySelectorAll('.popup-input');
    inputs.forEach(input => input.parentElement?.removeChild(input));
    this.popupOpen = false;
    this.currentPopup = null;
  }

  private closeCurrentPopup(): void {
    if (this.currentPopup && this.currentPopup.parentNode) {
      this.currentPopup.parentNode.removeChild(this.currentPopup);
      this.currentPopup = null;
    }
    if (this.currentCloseIcon && this.currentCloseIcon.parentNode) {
      this.currentCloseIcon.parentNode.removeChild(this.currentCloseIcon);
      this.currentCloseIcon = null;
    }
    this.popupOpen = false;
  }

  public destroy(): void {
    this.removeEventListeners();
    this.removeCanvas();
    this.closeCurrentPopup();
    this.imageCache.clear();
    this.buttons = [];
  }
}
