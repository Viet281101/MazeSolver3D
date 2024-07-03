import './style.css';
import { Maze } from './maze';
import { Toolbar } from './toolbar';

class MainApp {
	private canvas: HTMLCanvasElement;
	private toolbar: Toolbar;
	private maze: Maze;

	constructor() {
		this.canvas = document.getElementById('mazeCanvas') as HTMLCanvasElement;
		this.toolbar = new Toolbar();
		this.maze = new Maze(this.canvas);

		window.addEventListener('resize', () => this.onWindowResize());
	}

	private onWindowResize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.toolbar.resizeToolbar();
		this.maze.resize();
	}
}

window.onload = () => {
	new MainApp();
};
