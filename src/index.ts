/**
 * Main exports for 3D Maze Visualizer
 */

// Resources
export { ResourceManager } from './resources/ResourceManager';
export { DisposalHelper } from './resources/DisposalHelper';
export { MeshFactory } from './resources/MeshFactory';
export type { WallParams, FloorParams } from './resources/MeshFactory';

// Maze classes
export { Maze } from './maze/Maze';
export type { MazeConfig } from './maze/Maze';
export { SingleLayerMaze } from './maze/SingleLayerMaze';
export { MultiLayerMaze } from './maze/MultiLayerMaze';

// GUI
export { GUIController } from './gui';
export type { GUISettings } from './gui';

// Main controller
export type { MazeController } from './maze/MazeController';
