import './style.css';
import { initMaze } from './maze';
import { Toolbar } from './toolbar';

class MainApp {
	private canvas: HTMLCanvasElement;
	private toolbar: Toolbar;

	constructor() {
		this.canvas = document.getElementById('mazeCanvas') as HTMLCanvasElement;
		this.toolbar = new Toolbar();

		this.initialize();
		window.addEventListener('resize', () => this.onWindowResize());
	}

	private initialize() {
		if (this.canvas) {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			initMaze(this.canvas);
		}
	}

	private onWindowResize() {
		if (this.canvas) {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		}
		this.toolbar.resizeToolbar();
	}
}

window.onload = () => {
	new MainApp();
};
