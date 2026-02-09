import { Toolbar } from '../toolbar';

type ToolMode = 'pen' | 'eraser' | 'start' | 'end';

interface CellPos {
  row: number;
  col: number;
}

interface MazePopupState {
  rows: number;
  cols: number;
  grid: number[][];
  start: CellPos | null;
  end: CellPos | null;
  tool: ToolMode;
  cellSize: number;
  scale: number;
  minScale: number;
  maxScale: number;
  offsetX: number;
  offsetY: number;
  isPanning: boolean;
  isDrawing: boolean;
  lastX: number;
  lastY: number;
}

/**
 * Show maze popup - Custom maze editor
 */
export function showMazePopup(toolbar: Toolbar): void {
  const popupContainer = toolbar.createPopupContainer('mazePopup', 'Custom Maze');
  popupContainer.classList.add('maze-popup');

  const canvas = popupContainer.querySelector('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: true,
  });

  if (!ctx) {
    console.error('Failed to get 2D context for maze popup');
    return;
  }

  canvas.classList.add('maze-popup__canvas');
  canvas.width = 330;
  canvas.height = 330;

  const controls = document.createElement('div');
  controls.className = 'maze-popup__controls';

  const sizeSection = document.createElement('div');
  sizeSection.className = 'maze-popup__section';

  const rowsInput = createNumberInput('Rows', 5, 80, 12);
  const colsInput = createNumberInput('Cols', 5, 80, 12);

  const createBtn = createButton('Create', 'maze-popup__btn');

  sizeSection.appendChild(rowsInput.wrapper);
  sizeSection.appendChild(colsInput.wrapper);
  sizeSection.appendChild(createBtn);

  const toolSection = document.createElement('div');
  toolSection.className = 'maze-popup__section';

  const penBtn = createButton('Pen', 'maze-popup__tool');
  const eraserBtn = createButton('Eraser', 'maze-popup__tool');
  const startBtn = createButton('Start', 'maze-popup__tool');
  const endBtn = createButton('End', 'maze-popup__tool');

  toolSection.appendChild(penBtn);
  toolSection.appendChild(eraserBtn);
  toolSection.appendChild(startBtn);
  toolSection.appendChild(endBtn);

  const actionSection = document.createElement('div');
  actionSection.className = 'maze-popup__section';

  const clearBtn = createButton('Clear', 'maze-popup__btn');
  const resetBtn = createButton('Reset', 'maze-popup__btn');
  const applyBtn = createButton('Apply', 'maze-popup__btn maze-popup__btn--primary');

  actionSection.appendChild(clearBtn);
  actionSection.appendChild(resetBtn);
  actionSection.appendChild(applyBtn);

  controls.appendChild(sizeSection);
  controls.appendChild(toolSection);
  controls.appendChild(actionSection);
  popupContainer.insertBefore(controls, canvas);

  const state: MazePopupState = {
    rows: rowsInput.input.valueAsNumber,
    cols: colsInput.input.valueAsNumber,
    grid: [],
    start: null,
    end: null,
    tool: 'pen',
    cellSize: 22,
    scale: 1,
    minScale: 0.35,
    maxScale: 6,
    offsetX: 0,
    offsetY: 0,
    isPanning: false,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
  };

  const toolButtons: Record<ToolMode, HTMLButtonElement> = {
    pen: penBtn,
    eraser: eraserBtn,
    start: startBtn,
    end: endBtn,
  };

  const setTool = (tool: ToolMode) => {
    state.tool = tool;
    Object.entries(toolButtons).forEach(([key, btn]) => {
      if (key === tool) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  };

  const initGrid = (rows: number, cols: number) => {
    const grid: number[][] = [];
    for (let r = 0; r < rows; r += 1) {
      const row: number[] = [];
      for (let c = 0; c < cols; c += 1) {
        const isBorder = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
        row.push(isBorder ? 1 : 0);
      }
      grid.push(row);
    }
    return grid;
  };

  const resetView = () => {
    const gridWidth = state.cols * state.cellSize;
    const gridHeight = state.rows * state.cellSize;
    const scale = 1;
    state.scale = scale;
    state.offsetX = (canvas.width - gridWidth * scale) / 2;
    state.offsetY = (canvas.height - gridHeight * scale) / 2;
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const draw = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(state.offsetX, state.offsetY);
    ctx.scale(state.scale, state.scale);

    const gridWidth = state.cols * state.cellSize;
    const gridHeight = state.rows * state.cellSize;

    ctx.fillStyle = '#e6e6e6';
    ctx.fillRect(0, 0, gridWidth, gridHeight);

    ctx.fillStyle = '#333';
    for (let r = 0; r < state.rows; r += 1) {
      for (let c = 0; c < state.cols; c += 1) {
        if (state.grid[r][c] === 1) {
          ctx.fillRect(
            c * state.cellSize,
            r * state.cellSize,
            state.cellSize,
            state.cellSize
          );
        }
      }
    }

    if (state.start) {
      ctx.fillStyle = 'rgba(0, 200, 120, 0.85)';
      ctx.fillRect(
        state.start.col * state.cellSize,
        state.start.row * state.cellSize,
        state.cellSize,
        state.cellSize
      );
    }

    if (state.end) {
      ctx.fillStyle = 'rgba(220, 60, 60, 0.85)';
      ctx.fillRect(
        state.end.col * state.cellSize,
        state.end.row * state.cellSize,
        state.cellSize,
        state.cellSize
      );
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1 / state.scale;
    for (let c = 0; c <= state.cols; c += 1) {
      const x = c * state.cellSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridHeight);
      ctx.stroke();
    }
    for (let r = 0; r <= state.rows; r += 1) {
      const y = r * state.cellSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gridWidth, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const getCellFromEvent = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - state.offsetX) / state.scale;
    const y = (e.clientY - rect.top - state.offsetY) / state.scale;
    const col = Math.floor(x / state.cellSize);
    const row = Math.floor(y / state.cellSize);
    if (row < 0 || col < 0 || row >= state.rows || col >= state.cols) {
      return null;
    }
    return { row, col };
  };

  const applyToolAt = (pos: CellPos | null) => {
    if (!pos) return;
    const { row, col } = pos;
    if (state.tool === 'pen') {
      state.grid[row][col] = 1;
    } else if (state.tool === 'eraser') {
      state.grid[row][col] = 0;
      if (state.start && state.start.row === row && state.start.col === col) {
        state.start = null;
      }
      if (state.end && state.end.row === row && state.end.col === col) {
        state.end = null;
      }
    } else if (state.tool === 'start') {
      state.grid[row][col] = 0;
      state.start = { row, col };
    } else if (state.tool === 'end') {
      state.grid[row][col] = 0;
      state.end = { row, col };
    }
    draw();
  };

  const rebuild = (rows: number, cols: number) => {
    state.rows = rows;
    state.cols = cols;
    state.grid = initGrid(rows, cols);
    state.start = null;
    state.end = null;
    resetView();
    draw();
  };

  createBtn.addEventListener('click', () => {
    const rows = clamp(rowsInput.input.valueAsNumber || 0, 5, 80);
    const cols = clamp(colsInput.input.valueAsNumber || 0, 5, 80);
    rowsInput.input.valueAsNumber = rows;
    colsInput.input.valueAsNumber = cols;
    rebuild(rows, cols);
  });

  clearBtn.addEventListener('click', () => {
    state.grid = initGrid(state.rows, state.cols);
    state.start = null;
    state.end = null;
    draw();
  });

  resetBtn.addEventListener('click', () => {
    rebuild(state.rows, state.cols);
  });

  applyBtn.addEventListener('click', () => {
    const mazeData = [state.grid.map(row => row.slice()).reverse()];
    const mazeApp = (window as any).mazeApp;
    if (!mazeApp || typeof mazeApp.updateMaze !== 'function') {
      console.warn('mazeApp.updateMaze not available');
      return;
    }
    mazeApp.updateMaze(mazeData, false);
  });

  penBtn.addEventListener('click', () => setTool('pen'));
  eraserBtn.addEventListener('click', () => setTool('eraser'));
  startBtn.addEventListener('click', () => setTool('start'));
  endBtn.addEventListener('click', () => setTool('end'));

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  canvas.addEventListener('mousedown', e => {
    if (e.button === 2) {
      state.isPanning = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      return;
    }
    if (e.button === 0) {
      state.isDrawing = true;
      applyToolAt(getCellFromEvent(e));
    }
  });

  canvas.addEventListener('mousemove', e => {
    if (state.isPanning) {
      const dx = e.clientX - state.lastX;
      const dy = e.clientY - state.lastY;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      state.offsetX += dx;
      state.offsetY += dy;
      draw();
      return;
    }
    if (state.isDrawing) {
      applyToolAt(getCellFromEvent(e));
    }
  });

  canvas.addEventListener('mouseup', () => {
    state.isPanning = false;
    state.isDrawing = false;
  });

  canvas.addEventListener('mouseleave', () => {
    state.isPanning = false;
    state.isDrawing = false;
  });

  canvas.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = Math.exp(-e.deltaY * 0.0015);
      const nextScale = clamp(state.scale * zoomFactor, state.minScale, state.maxScale);

      const worldX = (mouseX - state.offsetX) / state.scale;
      const worldY = (mouseY - state.offsetY) / state.scale;

      state.scale = nextScale;
      state.offsetX = mouseX - worldX * state.scale;
      state.offsetY = mouseY - worldY * state.scale;
      draw();
    },
    { passive: false }
  );

  setTool('pen');
  rebuild(state.rows, state.cols);
}

function createNumberInput(label: string, min: number, max: number, value: number) {
  const wrapper = document.createElement('label');
  wrapper.className = 'maze-popup__input';

  const span = document.createElement('span');
  span.textContent = label;

  const input = document.createElement('input');
  input.type = 'number';
  input.min = String(min);
  input.max = String(max);
  input.value = String(value);

  wrapper.appendChild(span);
  wrapper.appendChild(input);

  return { wrapper, input };
}

function createButton(text: string, className: string) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = text;
  btn.className = className;
  return btn;
}
