import { DrawingSurface } from './drawingSurface.js';
 
(() => {
    window.onload = () => {
        const grid = { x:20, y:20, size: 30}
        new DrawingSurface( 'drawing-surface', grid );
    }
})();
