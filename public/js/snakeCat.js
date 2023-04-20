import { Part, getPartByConnections, checkDirection } from './cat.js';
import { CHAR_SMALL, GAME_OVER_ANIMATION } from './characters.js';

export const TICK_TIME = 500;

const DIRECTIONS = Object.freeze(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

const OPPOSITES = Object.freeze({
    'ArrowUp': 'ArrowDown',
    'ArrowDown': 'ArrowUp',
    'ArrowLeft': 'ArrowRight',
    'ArrowRight': 'ArrowLeft'
  });

export class SnakeCatPart {
    constructor(cords, part) {
        this._cords = cords;
        this._part = part;
    }
    getPart() {
        return this._part;
    }

    setPart(part) {
        this._part = part;
    }

    getType() {
        return this._part.getName();
    }

    getCoordinates() {
        return this._cords;
    }

    updatePart(coordinates) {
        let connections = this._part.getConnections();
        Object.assign(connections, checkDirection(this._cords, coordinates));
        let thePart = getPartByConnections(connections);
        this._part = thePart;
    }

    sameCoordinates(coordinates) {
        return this._cords.x === coordinates.x && this._cords.y === coordinates.y;
    }
}

export class SnakeCat {
    constructor(grid = { x: 10, y: 10 }, length = 3, drawFunction = () => { }) {
        this._grid = grid;
        const start = { x: Math.floor(grid.x / 2), y: Math.floor((grid.y - length) / 2) + 3 };// +3 is to add space for the score board
        this.parts = [];
        this._drawFunction = drawFunction;
        this._food;
        this._direction = 'ArrowUp';
        this._interval;
        this._score = 0;
        this._gameOver = false;
        this._collectedFood = 0;
        this._level = 1;
        this._speed = TICK_TIME;
        this.#createSnakeCat(start, length);
    }

    #createSnakeCat(start, length) {
        for (let i = 0; i < length; i++) {
            let part;
            if (i === 0) {
                // First part is head
                this.#addPart(new SnakeCatPart({ x: start.x, y: start.y }, Part.HEAD));
            } else if (i === length - 1) {
                // Last part is legs
                this.#addPart(new SnakeCatPart({ x: start.x, y: start.y + i }, Part.LEGS));
            } else {
                // Middle parts are body
                this.#addPart(new SnakeCatPart({ x: start.x, y: start.y + i }, Part.BODY));
            }
        }
        this.#addFood();
        this.printScore();
        this.printLevel();
    }

    #moveTo(coordinates) {
        if (this.#cantMove(coordinates)) {
            this.#gameOver();
            return;
        }
        if (this.#isOnFood(coordinates)) {
            this.#eatFood(coordinates);
        } else {
            this.#updateHead(coordinates);
            this.#updateTail();
        }
    }

    #gameOver() {
        this.stop();
        this._gameOver = true;
        this.#animateGameOverLoop();
    }

    start() {
        this._interval = setInterval(() => {
            this.#move();
        }, this._speed);
        this.#bindKeyboardEvents();
        this._gameOver = false;
    }

    stop() {
        clearInterval(this._interval);
        this.#teardown();
    }

    #changeSpeed() {
        this._speed = TICK_TIME - ( ( this._level - 1 ) * 50);
        this.stop();
        this.start();
    }

    #move() {
        let key = this._direction;
        let coordinates = { ...this.getPosition() };
        switch (key) {
            case 'ArrowUp': {
                coordinates.y -= 1;
                break;
            }
            case 'ArrowDown': {
                coordinates.y += 1;
                break;
            }
            case 'ArrowLeft': {
                coordinates.x -= 1;
                break;
            }
            case 'ArrowRight': {
                coordinates.x += 1;
                break;
            }
            default: {
                return;
            }
        }
        this.#moveTo(coordinates);
    }

    #randomCoordinate() {
        const { x, y } = this._grid;
        const n = Math.floor(Math.random() * (x * (y - 3))) + x * 3;
        const col = n % x;
        const row = Math.floor(n / x);
        const coordinates = { x: col, y: row };
        return this.#isOnSnake(coordinates) ? this.#randomCoordinate() : coordinates;
    }

    #addPart(part) {
        this.parts.push(part);
        this._drawFunction(part.getCoordinates(), part.getType());
    }

    #drawPart(part) {
        this._drawFunction(part.getCoordinates(), part.getType());
    }

    #removePart(part) {
        this._drawFunction(part.getCoordinates(), Part.BLANK.getName());
    }

    #addFood() {
        this._food = this.#randomCoordinate();
        this._drawFunction(this._food, Part.LONGCAT.getName());
    }

    #eatFood(coordinates) {
        this._collectedFood++;
        if (this._collectedFood % 5 === 0) {
            this._level++;
            this.#changeSpeed();
            this.printLevel();
        }
        this._score += this._level;
        this.#updateHead(coordinates);
        this.#addFood();
        this.printScore();
        this.printLevel();
    }

    #cantMove(coordinates) {
        return this.parts[1].sameCoordinates(coordinates) || this.#isOutOfBounds(coordinates) || this.#isOnSnake(coordinates);
    }

    #isOutOfBounds(coordinates) {
        return coordinates.x < 0 || coordinates.x >= this._grid.x || coordinates.y < 3 || coordinates.y >= this._grid.y;
    }

    #isOnSnake(coordinates) {
        return this.parts.some(part => part.sameCoordinates(coordinates));
    }

    #isOnFood(coordinates) {
        return this._food.x === coordinates.x && this._food.y === coordinates.y;
    }

    #updateHead(coordinates) {
        const head = this.getHead();
        const headCords = head.getCoordinates();
        const newHeadDirection = checkDirection(coordinates, headCords);
        const newHead = getPartByConnections(Object.assign({ n: 0, s: 0, v: 0, e: 0 }, newHeadDirection));
        head.updatePart(coordinates);
        this.parts.unshift(new SnakeCatPart(coordinates, newHead));
        this.#drawPart(this.parts[0]);
        this.#drawPart(this.parts[1]);
    }

    #updateTail() {
        const oldTale = this.parts.pop();
        const tail = this.getTail();
        let newTailDirection = checkDirection(tail.getCoordinates(), this.parts[this.parts.length - 2].getCoordinates());
        let newTail = getPartByConnections(Object.assign({ n: 0, s: 0, v: 0, e: 0 }, newTailDirection));
        tail.setPart(newTail);
        this.#drawPart(tail);
        this.#removePart(oldTale);
    }

    getSnakeCat() {
        return this.parts;
    }

    getHead() {
        return this.parts[0];
    }

    getTail() {
        return this.parts[this.parts.length - 1];
    }

    setDirection(key) {
        // Check if the key is a valid direction and if it is not the opposite of the current direction
        const oppositeDirection = OPPOSITES[this._direction];
        if (key !== oppositeDirection) {
          this._direction = key;
        }
    }

    getPosition() {
        return this.getHead().getCoordinates();
    }

    getScore() {
        return this._score;
    }

    getLevel() {
        return this._level;
    }

    getCollectedFood() {
        return this._collectedFood;
    }

    getSpeed() {
        return this._speed;
    }

    getDirection() {
        return this._direction;
    }

    printScore() {
        let scoreLength = 4;
        let startX = this._grid.x - scoreLength * 2;
        let startY = 0;
        let scoreString = this._score.toString().padStart(scoreLength, '0');
        this.#drawString(scoreString, startX, startY);
    }

    printLevel() {
        let levelLength = 2;
        let startX = 0;
        let startY = 0;
        let levelString = this._level.toString().padStart(levelLength, '0');
        this.#drawString(levelString, startX, startY);
    }

    isDead() {
        return this._gameOver;
    }

    #drawString(string, x, y) {
        string.split('').map(char => CHAR_SMALL[char])
            .forEach( (char, index) => {
                this.#drawChar(char, x + index * 2, y);
            });
    }

    #drawChar(char, x, y) {
        char.forEach( (row, rowIndex) => {
            row.forEach( (col, colIndex) => {
                this._drawFunction({ x: x + colIndex, y: y + rowIndex }, col);
            });
        });
    }

    #bindKeyboardEvents() {
        document.addEventListener('keydown', this.#keyDownHandler);
    }

    #teardown() {
        document.removeEventListener('keydown', this.#keyDownHandler);
    }

    #keyDownHandler = (event) => {
        if ( DIRECTIONS.includes(event.key) ) {
            event.preventDefault();
            this.setDirection(event.key);
        }   
    }

    #animateGameOverLoop(index = 0) {
        if (index < GAME_OVER_ANIMATION.length) {
            this.#drawGameOver(index);
            setTimeout(() => {
                this.#animateGameOverLoop(index + 1);
            }, 400);
        }
    }

    #drawGameOver( index ) {
        const offsetY = Math.floor( (this._grid.y - 8) / 2 );
        const offsetX = Math.floor( (this._grid.x - 13) / 2 );
        GAME_OVER_ANIMATION[index].forEach( ( {x, y, name} ) => {
            try {
                this._drawFunction({ x: x + offsetX, y: y + offsetY }, name);
            }
            catch (e) {
                console.log(e);
                console.log({ x, y, name });
            }
        });
    }
}