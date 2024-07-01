export function initMaze(canvas: HTMLCanvasElement) {
	const gl = canvas.getContext('webgl');
	if (!gl) {
		console.error('WebGL not supported');
		return;
	}

	// Set up WebGL context and other initialization here
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}
