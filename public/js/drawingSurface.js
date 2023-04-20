import { initButtons } from "./button.js";
import {
  Part,
  createEmojiString,
  createMatrix,
  resetPart,
  updateMatrix,
  updateMatrixByPath,
} from "./cat.js";
import { preeLoadImages } from "./image.js";
import { SnakeCat } from "./snakeCat.js";

export const BUTTONS_AND_SEPARATORS = [
  { name: "pen", icon: "fa-pen", active: true },
  { name: "eraser", icon: "fa-eraser", active: false },
  { name: "separator", separator: true },
  { name: "copy", icon: "fa-copy", active: false },
  { name: "separator", separator: true },
  { name: "refresh", icon: "fa-arrows-rotate", active: false },
];

export class Canvas {
  constructor(grid) {
    const { x, y, size } = grid ?? { x: 0, y: 0, size: 0 };
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.setHeight(y * (size + 1));
    this.setWidth(x * (size + 1));
    this.numCols = x;
    this.numRows = y;
    this.gridSize = size;
    this.newGrid();
  }

  setHeight(height) {
    this.height = height;
    this.canvas.height = height;
  }

  setWidth(width) {
    this.width = width;
    this.canvas.width = width;
  }

  getCanvas() {
    return this.canvas;
  }

  getContext() {
    return this.context;
  }

  newGrid = () => {
    this.setBackground();
    this.createGrid();
  };

  setBackground = () => {
    this.context.fillStyle = "rgb(76, 81, 92)";
    this.context.fillRect(0, 0, this.width, this.height);
  };

  createGridPart = (coordinate) => {
    const [x, y] = this.getGridPosition(coordinate);
    this.context.fillStyle = "rgb(34,37,41)";
    this.context.fillRect(x, y, this.gridSize, this.gridSize);
  };

  createGrid = () => {
    const rects = Array.from({ length: this.numRows }, (_, row) =>
      Array.from({ length: this.numCols }, (_, col) => ({ row, col }))
    );

    rects.forEach((row, i) =>
      row.forEach(({ row, col }) => {
        this.createGridPart({ x: col, y: row });
      })
    );
  };

  getGridPosition = ({ x, y }) => [
    x * (this.gridSize + 1),
    y * (this.gridSize + 1),
  ];

  addImage = (coordinate, image) => {
    const [x, y] = this.getGridPosition(coordinate);
    this.createGridPart(coordinate);
    this.context.drawImage(image, x, y, this.gridSize, this.gridSize);
  };

  getGridPart(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / (this.gridSize + 1));
    const y = Math.floor((event.clientY - rect.top) / (this.gridSize + 1));
    return x <= this.numCols && y <= this.numRows ? { x, y } : null;
  }
}

export class Separator {
  constructor() {
    this.separator = document.createElement("div");
    this.separator.classList.add("separator");
  }

  getSeparator() {
    return this.separator;
  }
}

export class Icon {
  constructor(icon) {
    this.icon = document.createElement("i");
    this.icon.classList.add("fa-solid", icon);
  }

  getIcon() {
    return this.icon;
  }
}

export class Button {
  constructor(name, icon, active = false) {
    this.button = document.createElement("div");
    this.button.classList.add("button");
    this.setActive(active);
    this.button.dataset.name = name;
    this.button.appendChild(new Icon(icon).getIcon());
  }

  setActive = (active) => {
    if (active) {
      this.button.classList.add("active");
    } else {
      this.button.classList.remove("active");
    }
    this.active = active;
  };

  isActive = () => this.active;

  getButton() {
    return this.button;
  }
}

export class Tools {
  constructor() {
    this.tools = document.createElement("div");
    this.tools.classList.add("tools");
    this.buttons = {};
  }

  getTools() {
    return this.tools;
  }

  getButtons() {
    return this.buttons;
  }

  getButton(name) {
    return this.buttons[name];
  }

  addButton = (name, icon, active) => {
    const button = new Button(name, icon, active);
    this.tools.appendChild(button.getButton());
    this.buttons[name] = button;
  };

  addButtons = (buttons) => {
    buttons.forEach(({ name, icon, active, separator }) => {
      if (separator) {
        this.addSeparator();
      } else {
        this.addButton(name, icon, active);
      }
    });
  };

  addSeparator = () => {
    const separator = new Separator();
    this.tools.appendChild(separator.getSeparator());
  };
}

export class DrawingSurface {
  constructor(id, grid) {
    this.drawingSurface = document.getElementById(id);
    this.grid = grid;
    this.canvas = new Canvas(this.grid);
    this.tools = new Tools();
    this.tools.addButtons(BUTTONS_AND_SEPARATORS);
    this.images = preeLoadImages(Object.values(Part).map((part) => part.name));
    this.drawingSurface.appendChild(this.canvas.getCanvas());
    this.drawingSurface.appendChild(this.tools.getTools());
    this.matrix = createMatrix(this.grid);
    this.drawing = false;
    this.eraser = false;
    this.lastPart = null;
    this.part = null;
    this.#bindButtonEvents();
    this.#bindCanvasEvents();
    this.#bindKeyboardEvents();
    this._sc;
  }

  #bindButtonEvents() {
    initButtons(
      this.tools.getButtons(),
      () => {
        return this.printMatrix();
      },
      (eraseMode) => {
        this.eraser = eraseMode;
      },
      () => {
        this.resetMatrix();
      }
    );
  }

  #bindCanvasEvents() {
    ["mousedown", "mousemove", "mouseup"].forEach((event) => {
      this.canvas.getCanvas().addEventListener(event, (e) => {
        if (e.type === "mousedown") this.startDrawing(); // Set drawing to true when mouse is down
        if (e.type === "mouseup") this.stopDrawing(); // Set drawing to false when mouse is up
        if (!this.isDrawing()) return; // If drawing is false, we don't want to do anything

        this.setPart(e);

        if (!this.part) return; // If part is null, we don't want to do anything

        if (this.isErasing()) {
          this.resetGridPart();
        } else {
          if (e.type === "mousedown") {
            const { name: partName } = updateMatrix(this.matrix, this.part);
            this.addImage(this.part, partName);
            this.setLastPart();
          } else if (e.type === "mousemove") {
            if (this.canMove()) {
              const [part, lastPart] = updateMatrixByPath(
                this.matrix,
                this.part,
                this.lastPart
              );
              this.addImage(this.part, part.getName());
              this.addImage(this.lastPart, lastPart.getName());
              this.setLastPart();
            }
          }
        }
      });
    });
  }

  #ssg() {
    if (this._sc && !this._sc.isDead()) return;
    this.canvas.newGrid();
    this._sc = new SnakeCat(this.grid, 3, (coordinate, name) => {
      this.addImage(coordinate, name);
    });
    this._sc.start();
  }

  #keyDownHandler = (event) => {
    if (event.key === "s") {
      this.#ssg();
      return;
    }
    // Need a starting part or
    if (!this.part || this._sc) return;
    // Only allow arrow keys
    if (
      !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
    )
      return;
    // Prevent default behavior
    event.preventDefault();
    const keyPart = this.#calculatePartBasedOnKey(event);
    if (keyPart) {
      this.#updateByKeyboard(keyPart);
    }
  };

  #calculatePartBasedOnKey = (event) => {
    // Create a new part based on the current part and the key pressed
    let keyPart = { ...this.part };
    if (event.key === "ArrowUp") {
      // Move up
      keyPart.y -= 1;
    } else if (event.key === "ArrowDown") {
      // Move down
      keyPart.y += 1;
    } else if (event.key === "ArrowLeft") {
      // Move left
      keyPart.x -= 1;
    } else if (event.key === "ArrowRight") {
      // Move right
      keyPart.x += 1;
    }

    // Check if the new part is within the grid
    if (
      keyPart.x < 0 ||
      keyPart.x > this.grid.x - 1 ||
      keyPart.y < 0 ||
      keyPart.y > this.grid.y - 1
    ) {
      return null;
    } else {
      return keyPart;
    }
  };

  #updateByKeyboard(keyPart) {
    const [part, lastPart] = updateMatrixByPath(
      this.matrix,
      keyPart,
      this.part
    );
    this.addImage(keyPart, part.getName());
    this.addImage(this.part, lastPart.getName());
    this.part = keyPart;
  }

  #bindKeyboardEvents() {
    document.addEventListener("keydown", this.#keyDownHandler);
  }

  teardown() {
    document.removeEventListener("keydown", this.#keyDownHandler);
  }

  // Check so last part is not null, and not the same part as the current part
  canMove() {
    if (!this.lastPart) return false;
    if (!this.part) return false;
    return this.lastPart.x !== this.part.x || this.lastPart.y !== this.part.y;
  }

  getButton(name) {
    return this.tools.getButton(name);
  }

  getCanvas() {
    return this.canvas;
  }

  getButtons() {
    return this.tools.getButtons();
  }

  getMatrix() {
    return this.matrix;
  }

  resetMatrix() {
    this.matrix = createMatrix(this.grid);
    this.canvas.newGrid();
  }

  printMatrix() {
    return createEmojiString(this.matrix);
  }

  isDrawing() {
    return this.drawing;
  }

  startDrawing() {
    this.drawing = true;
  }

  stopDrawing() {
    this.drawing = false;
    this.lastPart = null;
  }

  isErasing() {
    return this.eraser;
  }

  setPart(event) {
    this.part = this.canvas.getGridPart(event);
  }

  getPart() {
    return this.part;
  }

  setLastPart() {
    this.lastPart = this.part;
  }

  getLastPart() {
    return this.lastPart;
  }

  resetGridPart() {
    resetPart(this.matrix, this.part);
    this.canvas.createGridPart(this.part);
  }

  addImage(coordinate, name) {
    this.canvas.addImage(coordinate, this.images[name]);
  }
}
