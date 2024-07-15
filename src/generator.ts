/**
 * Generates a maze using the randomized depth-first search algorithm.
 *
 * @param {number} width - The width of the maze.
 * @param {number} height - The height of the maze.
 * @param {string} mazeEntries - The type of entries for the maze ('none', 'diagonal', 'left&right', 'top&bottom').
 * @param {string} bias - The bias for the maze generation ('none', 'horizontal', 'vertical').
 * @returns {number[][]} - A 2D array representing the maze, where 0 is a passage and 1 is a wall.
 */
export function randomizedDepthFirst(
	width: number,
	height: number,
	mazeEntries: string = 'none',
	bias: string = 'none'
): number[][] {
	const maze: number[][] = Array.from({ length: height }, () => Array(width).fill(1));

	function carve(x: number, y: number) {
		let directions: number[][] = [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1],
		];

		if (bias === 'horizontal') {
			directions = directions.sort(() => Math.random() - 0.5).sort((a, b) => b[0] - a[0]);
		} else if (bias === 'vertical') {
			directions = directions.sort(() => Math.random() - 0.5).sort((a, b) => b[1] - a[1]);
		} else {
			directions = directions.sort(() => Math.random() - 0.5);
		}

		directions.forEach(([dx, dy]) => {
			const nx = x + dx * 2;
			const ny = y + dy * 2;
			if (nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx] === 1) {
			maze[ny][nx] = 0;
			maze[y + dy][x + dx] = 0;
			carve(nx, ny);
			}
		});
	}

	maze[1][1] = 0;
	carve(1, 1);

	for (let i = 0; i < width; i++) {
		maze[0][i] = 1;
		maze[height - 1][i] = 1;
	}
	for (let i = 0; i < height; i++) {
		maze[i][0] = 1;
		maze[i][width - 1] = 1;
	}

	if (mazeEntries === 'diagonal') {
		maze[1][0] = 0;
		maze[height - 2][width - 1] = 0;
	} else if (mazeEntries === 'left&right') {
		maze[Math.floor(height / 2)][0] = 0;
		maze[Math.floor(height / 2)][width - 1] = 0;
	} else if (mazeEntries === 'top&bottom') {
		maze[0][Math.floor(width / 2)] = 0;
		maze[height - 1][Math.floor(width / 2)] = 0;
	}

	return maze;
}

/**
 * Generates a maze using the iterative randomized Prim's algorithm.
 *
 * @param {number} width - The width of the maze.
 * @param {number} height - The height of the maze.
 * @param {string} mazeEntries - The type of entries for the maze ('none', 'diagonal', 'left&right', 'top&bottom').
 * @param {string} bias - The bias for the maze generation ('none', 'horizontal', 'vertical').
 * @returns {number[][]} - A 2D array representing the maze, where 0 is a passage and 1 is a wall.
 */
export function randomizedPrims(
	width: number,
	height: number,
	mazeEntries: string = 'none',
	bias: string = 'none'
): number[][] {
	const maze: number[][] = Array.from({ length: height }, () => Array(width).fill(1));
	const walls: [number, number][] = [];

	function addWalls(x: number, y: number) {
		if (x > 1 && maze[y][x - 2] === 1) walls.push([x - 2, y]);
		if (x < width - 2 && maze[y][x + 2] === 1) walls.push([x + 2, y]);
		if (y > 1 && maze[y - 2][x] === 1) walls.push([x, y - 2]);
		if (y < height - 2 && maze[y + 2][x] === 1) walls.push([x, y + 2]);
	}

	maze[1][1] = 0;
	addWalls(1, 1);

	while (walls.length > 0) {
		const [x, y] = walls.splice(Math.floor(Math.random() * walls.length), 1)[0];

		const neighbors = [
			[x - 2, y],
			[x + 2, y],
			[x, y - 2],
			[x, y + 2]
		].filter(([nx, ny]) => nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx] === 0);

		if (neighbors.length > 0) {
			const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
			maze[(y + ny) / 2][(x + nx) / 2] = 0;
			maze[y][x] = 0;
			addWalls(x, y);
		}
	}

	for (let i = 0; i < width; i++) {
		maze[0][i] = 1;
		maze[height - 1][i] = 1;
	}
	for (let i = 0; i < height; i++) {
		maze[i][0] = 1;
		maze[i][width - 1] = 1;
	}

	if (mazeEntries === 'diagonal') {
		maze[1][0] = 0;
		maze[height - 2][width - 1] = 0;
	} else if (mazeEntries === 'left&right') {
		maze[Math.floor(height / 2)][0] = 0;
		maze[Math.floor(height / 2)][width - 1] = 0;
	} else if (mazeEntries === 'top&bottom') {
		maze[0][Math.floor(width / 2)] = 0;
		maze[height - 1][Math.floor(width / 2)] = 0;
	}

	return maze;
}

