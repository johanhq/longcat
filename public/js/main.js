import { DrawingSurface } from './drawingSurface.js';
 
(() => {
    window.onload = () => {
        const grid = { x:20, y:20, size: 30}
        const drawingSurface = new DrawingSurface( 'drawing-surface', grid );
        drawingSurface.bindCanvasEvents();
    }
})();
