import './style.css';
import { initMaze } from './maze';

window.onload = () => {
	const canvas = document.getElementById('mazeCanvas') as HTMLCanvasElement;
	if (canvas) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		initMaze(canvas);
	}
};
