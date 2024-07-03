import './style.css';
import { initMaze } from './maze';
import { Toolbar } from './toolbar';

window.onload = () => {
	const canvas = document.getElementById('mazeCanvas') as HTMLCanvasElement;
	if (canvas) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		initMaze(canvas);
	}
	const toolbar = new Toolbar();
};
