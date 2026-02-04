import { Toolbar } from '../toolbar';

/**
 * Show maze popup - Optimized version
 */
export function showMazePopup(toolbar: Toolbar): void {
  const popupContainer = toolbar.createPopupContainer('mazePopup', 'Custom Maze');
  const popup = popupContainer.querySelector('canvas') as HTMLCanvasElement;
  const ctx = popup.getContext('2d', {
    alpha: false,
    desynchronized: true,
  });

  if (!ctx) {
    console.error('Failed to get 2D context for maze popup');
    return;
  }

  ctx.fillStyle = '#a0a0a0';
  ctx.fillRect(0, 0, popup.width, popup.height);
}
