import * as dat from 'dat.gui';

export class GUIController {
  private gui: dat.GUI;
  private settings: any;
  private mainApp: any;

  constructor(mainApp: any) {
    this.mainApp = mainApp;
    this.settings = {
      backgroundColor: '#000000',
      wallColor: '#808080',
      floorColor: '#C0C0C0',
      wallOpacity: 1.0,
      floorOpacity: 1.0,
    };
    this.gui = new dat.GUI();
    this.init();
    this.checkWindowSize();
  }

  private init() {
    const guiContainer = document.querySelector('.dg') as HTMLElement;
    if (guiContainer) {
      guiContainer.classList.add('scaled-gui');
      guiContainer.style.zIndex = '1000';
      guiContainer.style.right = '-22px';
      guiContainer.style.transformOrigin = 'top right';
      guiContainer.style.transform = 'scale(1.5)';
    }
    this.gui.addColor(this.settings, 'backgroundColor').onChange((value: string) => {
      if (this.mainApp.getRenderer()) {
        this.mainApp.getRenderer().setClearColor(value);
      }
    });
    this.gui.addColor(this.settings, 'wallColor').onChange((value: string) => {
      this.mainApp.updateWallColor(value);
    });
    this.gui.addColor(this.settings, 'floorColor').onChange((value: string) => {
      this.mainApp.updateFloorColor(value);
    });
    this.gui.add(this.settings, 'wallOpacity', 0, 1).onChange((value: number) => {
      this.mainApp.updateWallOpacity(value);
    });
    this.gui.add(this.settings, 'floorOpacity', 0, 1).onChange((value: number) => {
      this.mainApp.updateFloorOpacity(value);
    });
  }

  public checkWindowSize() {
    if (this.gui.domElement) {
      this.gui.domElement.style.display = window.innerWidth <= 800 ? 'none' : 'block';
    }
  }
}
