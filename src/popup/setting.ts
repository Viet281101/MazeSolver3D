import { Toolbar } from '../toolbar';

export function showSettingsPopup(toolbar: Toolbar) {
  const popupContainer = toolbar.createPopupContainer('settingsPopup', 'Settings');
  const popup = popupContainer.querySelector('canvas') as HTMLCanvasElement;
  const ctx = popup.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(0, 0, popup.width, popup.height);
  }
}
