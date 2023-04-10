/**
 * @jest-environment jsdom
 */

import { Canvas, DrawingSurface, Separator, Button, Icon, Tools, BUTTONS_AND_SEPARATORS } from '../public/js/drawingSurface';
import { Part, updateMatrix } from '../public/js/cat';
import { jest } from '@jest/globals';
import 'jest-canvas-mock';


// Test creating a canvas
describe('Creating a new Canvas', () => {
    it('should return a canvas element', () => {
        const canvas = new Canvas();
        expect(canvas.getCanvas()).toBeInstanceOf(HTMLCanvasElement);
        expect(canvas.getContext()).toBeInstanceOf(CanvasRenderingContext2D);
    });

    it('should return a canvas element with the correct width and height', () => {
        const grid = { x: 10, y: 10, size: 50 };
        const canvas = new Canvas(grid);
        expect(canvas.getCanvas().width).toBe(510);
        expect(canvas.getCanvas().height).toBe(510);
    });

    it('should return a canvas element with the correct width and height', () => {
        const grid = { x: 10, y: 10, size: 50 };
        const canvas = new Canvas(grid);
        expect(canvas.getCanvas().width).toBe(510);
        expect(canvas.getCanvas().height).toBe(510);
    });
});

// Testing to check for a grid position
describe('Testing to check for a grid position', () => {
    const grid = { x: 3, y: 3, size: 10 };
    const canvas = new Canvas(grid);
    it('Should return the correct position for the grit at x and y cordinates', () => {
        expect(canvas.getGridPosition({ x: 0, y: 0 })).toEqual([0, 0]);
        expect(canvas.getGridPosition({ x: 1, y: 1 })).toEqual([11, 11]);
        expect(canvas.getGridPosition({ x: 2, y: 2 })).toEqual([22, 22]);
    });
});

describe('Testing to create a single grid part', () => {
    const grid = { x: 3, y: 3, size: 10 };
    const canvas = new Canvas(grid);
    const context = canvas.getContext();

    beforeEach(() => {
        jest.spyOn(context, 'fillRect').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should add a grid part to the canvas', () => {
        // Call the function
        canvas.createGridPart({ x: 0, y: 0 });

        // Assert that fillRect was called with the correct arguments
        expect(context.fillRect).toHaveBeenCalledWith(0, 0, 10, 10);
    });
});

describe('addImageToCanvas', () => {
    const grid = { x: 3, y: 3, size: 50 };

    // Create mock canvas
    const canvas = new Canvas(grid);

    beforeEach(() => {
        jest.spyOn(canvas.getContext(), 'fillRect').mockImplementation(() => { });
        jest.spyOn(canvas.getContext(), 'drawImage').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('Adds an image to the canvas at the specified coordinate', () => {
        // Create mock input values
        const coordinate = { x: 0, y: 0 };
        const image = new Image();

        const context = canvas.getContext();

        // Call the function
        canvas.addImage(coordinate, image);

        // Assert that the expected methods were called on the context object
        expect(context.fillRect).toHaveBeenCalledWith(0, 0, grid.size, grid.size);
        expect(context.drawImage).toHaveBeenCalledWith(image, 0, 0, grid.size, grid.size);

        // Call the function with new coordinate
        canvas.addImage({ x: 1, y: 1 }, image);

        // Assert that the expected methods were called on the context object
        expect(context.fillRect).toHaveBeenCalledWith(51, 51, grid.size, grid.size);
        expect(context.drawImage).toHaveBeenCalledWith(image, 51, 51, grid.size, grid.size);
    });
});

describe('Creating the grid for a canvas', () => {
    const grid = { x: 3, y: 3, size: 1 };
    const canvas = new Canvas(grid);
    const context = canvas.getContext();

    beforeEach(() => {
        jest.spyOn(context, 'fillRect').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should create a grid with the correct number of empty grid parts', () => {
        canvas.createGrid();
        expect(context.fillRect).toHaveBeenCalledTimes(9);
    });

    it('should create a grid with empty grid parts at the correct positions', () => {
        canvas.createGrid();
        expect(context.fillRect.mock.calls[0]).toEqual([0, 0, 1, 1]);
        expect(context.fillRect.mock.calls[1]).toEqual([2, 0, 1, 1]);
        expect(context.fillRect.mock.calls[2]).toEqual([4, 0, 1, 1]);
        expect(context.fillRect.mock.calls[3]).toEqual([0, 2, 1, 1]);
        expect(context.fillRect.mock.calls[4]).toEqual([2, 2, 1, 1]);
        expect(context.fillRect.mock.calls[5]).toEqual([4, 2, 1, 1]);
        expect(context.fillRect.mock.calls[6]).toEqual([0, 4, 1, 1]);
        expect(context.fillRect.mock.calls[7]).toEqual([2, 4, 1, 1]);
        expect(context.fillRect.mock.calls[8]).toEqual([4, 4, 1, 1]);
    });
});

describe('Testing to set a background on the canvas', () => {
    // create a mock canvas and context
    const grid = { x: 3, y: 3, size: 1 };
    const canvas = new Canvas(grid);
    const context = canvas.getContext();

    beforeEach(() => {
        jest.spyOn(context, 'fillRect').mockImplementation(() => { });
        jest.spyOn(context, 'fillStyle', 'set');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('Should set the background of the canvas to the specified color', () => {
        // call the function
        canvas.setBackground();

        // check that the background color has been set correctly
        expect(context.fillStyle).toEqual('#4c515c'); // rgb(76, 81, 92) is the default background color and returned as hex by the function
        expect(context.fillRect).toHaveBeenCalledTimes(1);
        expect(context.fillRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
    });
});

describe('Testing interaction with the canvas', () => {
    const grid = { x: 3, y: 3, size: 10 };
    let canvas;

    beforeEach(() => {
        // Override the getContext method of HTMLCanvasElement.prototype to return the fake context object
        HTMLCanvasElement.prototype.getContext = jest.fn(function () {return { fillRect: jest.fn(), fillStyle: '#222529', drawImage: jest.fn()}});
        canvas = new Canvas(grid);
    });

    afterEach(() => {
        // Restore the original getContext method of HTMLCanvasElement.prototype
        jest.restoreAllMocks();
    });

    it('should return the correct grid part for event', () => {
        let event = new MouseEvent('click', { clientX: 25, clientY: 35 });
        let gridPart = canvas.getGridPart(event);
        expect(gridPart).toEqual({ x: 2, y: 3 });
        event = new MouseEvent('click', { clientX: 12, clientY: 17 });
        gridPart = canvas.getGridPart(event);
        expect(gridPart).toEqual({ x: 1, y: 1 });
    });

    it('should return null if the event is outside the canvas', () => {
        const event = new MouseEvent('click', { clientX: 100, clientY: 100 });
        const gridPart = canvas.getGridPart(event);
        expect(gridPart).toBeNull();
    });
});



describe('Testing the refresh of a canvas. It sets background and paints a grid', () => {
    const grid = { x: 3, y: 3, size: 1 };
    const canvas = new Canvas(grid);
    const context = canvas.getContext();

    beforeEach(() => {
        jest.spyOn(context, 'fillRect').mockImplementation(() => { });
        jest.spyOn(context, 'fillStyle', 'set');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should refresh the canvas', () => {
        canvas.newGrid();
        expect(context.fillStyle).toEqual('#222529'); // rgb(34,37,41) is the grid color and returned as hex by the function
        expect(context.fillRect).toHaveBeenCalledTimes(10); // 9 grid parts + 1 background
    });

    it('should refresh the canvas with the correct grid parts', () => {
        canvas.newGrid();
        expect(context.fillRect.mock.calls[0]).toEqual([0, 0, canvas.width, canvas.height]);
        expect(context.fillRect.mock.calls[1]).toEqual([0, 0, 1, 1]);
        expect(context.fillRect.mock.calls[2]).toEqual([2, 0, 1, 1]);
        expect(context.fillRect.mock.calls[3]).toEqual([4, 0, 1, 1]);
        expect(context.fillRect.mock.calls[4]).toEqual([0, 2, 1, 1]);
        expect(context.fillRect.mock.calls[5]).toEqual([2, 2, 1, 1]);
        expect(context.fillRect.mock.calls[6]).toEqual([4, 2, 1, 1]);
        expect(context.fillRect.mock.calls[7]).toEqual([0, 4, 1, 1]);
        expect(context.fillRect.mock.calls[8]).toEqual([2, 4, 1, 1]);
        expect(context.fillRect.mock.calls[9]).toEqual([4, 4, 1, 1]);
    });
});

describe('Test creating a separator', () => {
    it('should return a div element', () => {
        const separator = new Separator();
        const domElement = separator.getSeparator();
        expect(separator).toBeInstanceOf(Separator);
        expect(domElement).toBeInstanceOf(HTMLDivElement);
        expect(domElement.classList.contains('separator')).toBe(true);
    });
});

describe('Test creating an icon', () => {
    it('should return an icon element', () => {
        const icon = new Icon('fa-pen');
        const domElement = icon.getIcon();
        expect(icon).toBeInstanceOf(Icon);
        expect(domElement).toBeInstanceOf(HTMLElement);
        expect(domElement.classList.contains('fa-solid')).toBe(true);
        expect(domElement.classList.contains('fa-pen')).toBe(true);
    });
});


describe('Test creating a button', () => {
    it('should return a button element', () => {
        const button = new Button('pencil', 'fa-pen', true);
        const domElement = button.getButton();
        expect(button).toBeInstanceOf(Button);
        expect(domElement).toBeInstanceOf(HTMLDivElement);
        expect(button.isActive()).toBe(true);
        expect(domElement.classList.contains('button')).toBe(true);
        expect(domElement.classList.contains('active')).toBe(true);
        expect(domElement.dataset.name).toEqual('pencil');
        expect(domElement.innerHTML).toEqual('<i class="fa-solid fa-pen"></i>');
        button.setActive(false);
        expect(button.isActive()).toBe(false);
        expect(domElement.classList.contains('active')).toBe(false);
    });
});

describe('Test creating tools with the Tools class', () => {
    let tools;

    beforeEach(() => {
        tools = new Tools();
        tools.addButtons(BUTTONS_AND_SEPARATORS);
    });

    it('should return an object with tools that contains buttons and separators', () => {
        const toolsElement = tools.getTools();
        const buttons = tools.getButtons();
        expect(tools).toBeInstanceOf(Tools);
        expect(toolsElement).toBeInstanceOf(HTMLDivElement);
        expect(toolsElement.classList.contains('tools')).toBe(true);
        expect(buttons).toBeInstanceOf(Object);
        expect(Object.keys(buttons).length).toBe(4);
        expect(toolsElement.childElementCount).toBe(6);
    });

    it('should return a button by name', () => {
        const button = tools.getButton('pen');
        expect(button).toBeInstanceOf(Button);
        expect(button.isActive()).toBe(true);
        expect(button.getButton().dataset.name).toEqual('pen');

        const button2 = tools.getButton('eraser');
        expect(button2).toBeInstanceOf(Button);
        expect(button2.isActive()).toBe(false);
        expect(button2.getButton().dataset.name).toEqual('eraser');
    });
});

// Test to create a DrawingSurface
describe('Test creating a DrawingSurface', () => {
    const ID = 'drawing-surface';
    const grid = { x: 20, y: 20, size: 30 }
    let drawingSurface;
    beforeEach(() => {
        // Override the getContext method of HTMLCanvasElement.prototype to return the fake context object
        HTMLCanvasElement.prototype.getContext = jest.fn(function () {return { fillRect: jest.fn(), fillStyle: '#222529', drawImage: jest.fn()}});
        const div = document.createElement('div');
        div.id = ID;
        document.body.appendChild(div);
        drawingSurface = new DrawingSurface(ID, grid);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should create a DrawingSurface with canvas and tools', () => {
        expect(drawingSurface).toBeInstanceOf(DrawingSurface);
        expect(drawingSurface.canvas).toBeInstanceOf(Canvas);
        expect(drawingSurface.getButtons()).toBeInstanceOf(Object);
        expect(drawingSurface.getButton('pen')).toBeInstanceOf(Button);
        expect(Object.keys(drawingSurface.getButtons()).length).toBe(4);
    });

    it('should create a DrawingSurface with a matrix with the rows and cols of the grid', () => {
        expect(drawingSurface.matrix).toBeInstanceOf(Array);
        expect(drawingSurface.matrix.length).toBe(grid.y);
        expect(drawingSurface.matrix[0].length).toBe(grid.x);
    });

    it('should return a button by name', () => {
        const button = drawingSurface.getButton('pen');
        expect(button).toBeInstanceOf(Button);
        expect(button.isActive()).toBe(true);
        expect(button.getButton().dataset.name).toEqual('pen');

        const button2 = drawingSurface.getButton('eraser');
        expect(button2).toBeInstanceOf(Button);
        expect(button2.isActive()).toBe(false);
        expect(button2.getButton().dataset.name).toEqual('eraser');
    });

    it('should start and stop drawing', () => {
        drawingSurface.startDrawing();
        expect(drawingSurface.isDrawing()).toBe(true);
        drawingSurface.stopDrawing();
        expect(drawingSurface.isDrawing()).toBe(false);
    });
});

describe('Test the refresh button', () => {
    const ID = 'drawing-surface';
    let drawingSurface;

    beforeEach(() => {
        // Override the getContext method of HTMLCanvasElement.prototype to return the fake context object
        HTMLCanvasElement.prototype.getContext = jest.fn(function () {return { fillRect: jest.fn(), fillStyle: '#222529', drawImage: jest.fn()}});
        const div = document.createElement('div');
        div.id = ID;
        document.body.appendChild(div);
        drawingSurface = new DrawingSurface(ID, { x: 20, y: 20, size: 30 });
        jest.spyOn(drawingSurface, 'resetMatrix');
    });

    afterEach(() => {
        jest.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('should call the resetMatrix function when the refresh button is pressed', () => {
        drawingSurface.getButton('refresh').getButton().click(); // simulate a click on the refresh button
        expect(drawingSurface.resetMatrix).toHaveBeenCalledTimes(1);
    });
});

describe('Test the pen and eraser button', () => {
    const ID = 'drawing-surface';
    beforeEach(() => {
        // Override the getContext method of HTMLCanvasElement.prototype to return the fake context object
        HTMLCanvasElement.prototype.getContext = jest.fn(function () {return { fillRect: jest.fn(), fillStyle: '#222529', drawImage: jest.fn()}});
        const div = document.createElement('div');
        div.id = ID;
        document.body.appendChild(div);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('should set eraser to false when the pen button is pressed', () => {
        const grid = { x: 20, y: 20, size: 30 }
        const drawingSurface = new DrawingSurface(ID, grid);
        drawingSurface.eraser = true;
        drawingSurface.getButton('pen').getButton().click(); // simulate a click on the pen button
        expect(drawingSurface.eraser).toBe(false);
    });

    it('should set eraser to true when the eraser button is pressed', () => {
        const grid = { x: 20, y: 20, size: 30 }
        const drawingSurface = new DrawingSurface(ID, grid);
        drawingSurface.getButton('eraser').getButton().click(); // simulate a click on the eraser button
        expect(drawingSurface.eraser).toBe(true);
    });
});


// Pressing copy button should call the printMatrix function
describe('Test the copy button', () => {
    const ID = 'drawing-surface';

    Object.assign(navigator, {
        clipboard: {
            writeText: () => { },
        },
    });

    beforeEach(() => {
        // Override the getContext method of HTMLCanvasElement.prototype to return the fake context object
        HTMLCanvasElement.prototype.getContext = jest.fn(function () {return { fillRect: jest.fn(), fillStyle: '#222529', drawImage: jest.fn()}});
        const div = document.createElement('div');
        div.id = ID;
        document.body.appendChild(div);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('should call the printMatrix function when the copy button is pressed', () => {
        const grid = { x: 20, y: 20, size: 30 }
        const drawingSurface = new DrawingSurface(ID, grid);
        jest.spyOn(drawingSurface, 'printMatrix').mockImplementation(() => { });
        drawingSurface.getButton('copy').getButton().click(); // simulate a click on the copy button
        expect(drawingSurface.printMatrix).toHaveBeenCalledTimes(1);
    });
});


describe('Test so we can reset a part of the grid', () => {
    const ID = 'drawing-surface';
    const grid = { x: 20, y: 20, size: 30 }
    let drawingSurface;

    beforeEach(() => {
        // Override the getContext method of HTMLCanvasElement.prototype to return the fake context object
        HTMLCanvasElement.prototype.getContext = jest.fn(function () {return { fillRect: jest.fn(), fillStyle: '#222529', drawImage: jest.fn()}});
        const div = document.createElement('div');
        div.id = ID;
        document.body.appendChild(div);
        drawingSurface = new DrawingSurface(ID, grid);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should reset a part of the grid', () => {
        drawingSurface.bindCanvasEvents();
        const matrix = drawingSurface.getMatrix();
        updateMatrix( matrix, { x: 10, y: 10 })
        expect(matrix[10][10]).toBe(Part.LONGCAT);
        drawingSurface.part = { x: 10, y: 10 };
        drawingSurface.resetGridPart();
        expect(matrix[10][10]).toBe(Part.BLANK);
    });
});
       

describe('Test interacting with the canvas for the drawingSurface', () => {
    const ID = 'drawing-surface';
    const grid = { x: 20, y: 20, size: 30 }
    let drawingSurface;

    beforeEach(() => {
        // Override the getContext method of HTMLCanvasElement.prototype to return the fake context object
        HTMLCanvasElement.prototype.getContext = jest.fn(function () {return { fillRect: jest.fn(), fillStyle: '#222529', drawImage: jest.fn()}});
        const div = document.createElement('div');
        div.id = ID;
        document.body.appendChild(div);
        drawingSurface = new DrawingSurface(ID, grid);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should return the correct part when the mouse is pressed', () => {
        const callback = jest.fn();
        drawingSurface.bindCanvasEvents( callback );
        const canvas = drawingSurface.getCanvas();
        const canvasElement = canvas.getCanvas();
        const event = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
        canvasElement.dispatchEvent(event);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual({ x: 0, y: 0 });
    });

    it('should draw on the canvas when the mouse is pressed and moved', () => {
        drawingSurface.bindCanvasEvents();
        const canvas = drawingSurface.getCanvas();
        const canvasElement = canvas.getCanvas();
        const event = new MouseEvent('mousedown', {
            clientX: 0,
            clientY: 0,
        });
        const event2 = new MouseEvent('mousemove', {
            clientX: 35,
            clientY: 15,
        });
        // Spy on the add image function
        const addImageSpy = jest.spyOn(drawingSurface, 'addImage');
        canvasElement.dispatchEvent(event);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual({ x: 0, y: 0 });
        expect(drawingSurface.getLastPart()).toEqual({ x: 0, y: 0 });
        canvasElement.dispatchEvent(event2);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual({ x: 1, y: 0 });
        expect(addImageSpy).toHaveBeenCalledTimes(3);
    });

    it('should stop drawing when the mouse is released', () => {
        const callback = jest.fn();
        drawingSurface.bindCanvasEvents( callback );
        const canvas = drawingSurface.getCanvas();
        const canvasElement = canvas.getCanvas();
        const event = new MouseEvent('mousedown', {
            clientX: 0,
            clientY: 0,
        });
        const event2 = new MouseEvent('mouseup', {
            clientX: 35,
            clientY: 15,
        });

        jest.spyOn(drawingSurface, 'addImage');
        canvasElement.dispatchEvent(event);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual({ x: 0, y: 0 });
        expect(drawingSurface.addImage).toHaveBeenCalledTimes(1);
        canvasElement.dispatchEvent(event2);
        expect(drawingSurface.isDrawing()).toBe(false);
        expect(drawingSurface.getPart()).toEqual({ x: 0, y: 0 });
        expect(drawingSurface.getLastPart()).toEqual(null);
        expect(drawingSurface.addImage).toHaveBeenCalledTimes(1);
    });

    it('should not draw when the mouse is moved without being pressed', () => {
        drawingSurface.bindCanvasEvents();
        const canvas = drawingSurface.getCanvas();
        const canvasElement = canvas.getCanvas();
        const event = new MouseEvent('mousemove', {
            clientX: 35,
            clientY: 15,
        });
        jest.spyOn(drawingSurface, 'addImage');
        canvasElement.dispatchEvent(event);
        expect(drawingSurface.isDrawing()).toBe(false);
        expect(drawingSurface.getPart()).toEqual(null);
        expect(drawingSurface.addImage).toHaveBeenCalledTimes(0);
    });

    it('should not draw when the mouse is moved outside the canvas', () => {
        drawingSurface.bindCanvasEvents();
        const canvas = drawingSurface.getCanvas();
        const canvasElement = canvas.getCanvas();
        const event = new MouseEvent('mousedown', {
            clientX: 0,
            clientY: 0,
        });
        const event2 = new MouseEvent('mousemove', {
            clientX: 1000,
            clientY: 1000,
        });
        jest.spyOn(drawingSurface, 'addImage');
        canvasElement.dispatchEvent(event);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual({ x: 0, y: 0 });
        expect(drawingSurface.addImage).toHaveBeenCalledTimes(1);
        canvasElement.dispatchEvent(event2);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual(null);
        expect(drawingSurface.addImage).toHaveBeenCalledTimes(1);
    });

    it('should call resetGridPart if erase is clicked and mouse move', () => {
        drawingSurface.bindCanvasEvents();
        const canvas = drawingSurface.getCanvas();
        const canvasElement = canvas.getCanvas();
        const event = new MouseEvent('mousedown', {
            clientX: 5,
            clientY: 5,
        });
        const event2 = new MouseEvent('mousemove', {
            clientX: 35,
            clientY: 15,
        });
        jest.spyOn(drawingSurface, 'resetGridPart');
        drawingSurface.getButton('eraser').getButton().click();
        expect(drawingSurface.isErasing()).toBe(true);
        canvasElement.dispatchEvent(event);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual({ x: 0, y: 0 });
        expect(drawingSurface.resetGridPart).toHaveBeenCalledTimes(1);
        expect(drawingSurface.getLastPart()).toEqual({ x: 0, y: 0 });
        canvasElement.dispatchEvent(event2);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual({ x: 1, y: 0 });
        expect(drawingSurface.resetGridPart).toHaveBeenCalledTimes(2);
    });

    it('should test so haveMoved only is true if we have a last part and it is not equal to current part', () => {
        drawingSurface.bindCanvasEvents();
        const canvas = drawingSurface.getCanvas();
        const canvasElement = canvas.getCanvas();
        const event = new MouseEvent('mousedown', {
            clientX: 5,
            clientY: 5,
        });
        const event2 = new MouseEvent('mousemove', {
            clientX: 35,
            clientY: 15,
        });
        const event3 = new MouseEvent('mousemove', {
            clientX: 37, // same grid part
            clientY: 15,
        });

        drawingSurface.setPart(event);
        expect(drawingSurface.getPart()).toEqual({ x: 0, y: 0 });
        expect(drawingSurface.haveMoved()).toBe(false);
        drawingSurface.setLastPart();
        expect(drawingSurface.getLastPart()).toEqual({ x: 0, y: 0 });
        expect(drawingSurface.haveMoved()).toBe(false);
        drawingSurface.setPart(event2);
        expect(drawingSurface.getPart()).toEqual({ x: 1, y: 0 });
        expect(drawingSurface.haveMoved()).toBe(true);
        drawingSurface.setLastPart();
        expect(drawingSurface.getLastPart()).toEqual({ x: 1, y: 0 });
        drawingSurface.setPart(event3);
        expect(drawingSurface.getPart()).toEqual({ x: 1, y: 0 });
        expect(drawingSurface.haveMoved()).toBe(false);
    });

    it('should only draw when the mosue move to the next grid part', () => {
        drawingSurface.bindCanvasEvents( );
        const canvas = drawingSurface.getCanvas();
        const canvasElement = canvas.getCanvas();
        const event = new MouseEvent('mousedown', {
            clientX: 5,
            clientY: 5,
        });
        const event2 = new MouseEvent('mousemove', {
            clientX: 35,
            clientY: 15,
        });
        const event3 = new MouseEvent('mousemove', {
            clientX: 37, // same grid part
            clientY: 15,
        });

        jest.spyOn(drawingSurface, 'addImage');
        canvasElement.dispatchEvent(event);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual({ x: 0, y: 0 });
        expect(drawingSurface.addImage).toHaveBeenCalledTimes(1);
        canvasElement.dispatchEvent(event2);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual({ x: 1, y: 0 });
        expect(drawingSurface.addImage).toHaveBeenCalledTimes(3);
        canvasElement.dispatchEvent(event3);
        expect(drawingSurface.isDrawing()).toBe(true);
        expect(drawingSurface.getPart()).toEqual({ x: 1, y: 0 });
        expect(drawingSurface.addImage).toHaveBeenCalledTimes(3);
    });
});