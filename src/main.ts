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
		const initialMaze = [
			[
				[1, 0, 1, 1, 1, 1],
				[1, 0, 0, 1, 0, 1],
				[1, 1, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 1],
				[1, 1, 1, 1, 1, 1],
			],
		];
		this.maze = new Maze(this.canvas, initialMaze);

		window.addEventListener('resize', () => this.onWindowResize());
	}

	private onWindowResize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.toolbar.resizeToolbar();
		this.maze.resize();
	}

	public updateMaze(newMaze: number[][][]) {
		this.maze.deleteMaze();
		this.maze = new Maze(this.canvas, newMaze);
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
