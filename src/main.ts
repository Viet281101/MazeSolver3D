import './style.css';
import { MainApp } from './app/MainApp';

// ========== Application Entry Point ==========

let app: MainApp | null = null;

window.onload = () => {
  try {
    app = new MainApp();
    // app.createMultiLayerMaze();
    (window as any).mazeApp = app;
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
};

// Cleanup while closing page
window.onbeforeunload = () => {
  if (app) {
    app.destroy();
    app = null;
  }
};
