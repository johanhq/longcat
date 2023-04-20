/**
 * @jest-environment jsdom
 */

import { Part } from '../public/js/cat';
import { jest } from '@jest/globals';
import { SnakeCatPart, SnakeCat, TICK_TIME } from '../public/js/snakeCat';
import { GAME_OVER_ANIMATION } from '../public/js/characters';

describe('Testing the SnakeCatPart', () => {
  test('Testing the constructor', () => {
    const part = new SnakeCatPart({ x: 1, y: 1 }, Part.HEAD);
    const cords = part.getCoordinates();
    expect(cords).toStrictEqual({ x: 1, y: 1 });
    expect(part).toBeInstanceOf(SnakeCatPart);
    expect(part.getPart()).toBe(Part.HEAD);
    expect(part.getType()).toBe(Part.HEAD.getName());
  });
});

describe('Testing the SnakeCat', () => {
  const grid = { x: 10, y: 10 };
  const length = 5;
  let tickTime = TICK_TIME;
  let snakeCat;
  const originalAlert = window.alert;

  beforeEach(() => {
    jest.useFakeTimers();
    snakeCat = new SnakeCat(grid, length); // Start cords are { x: 5, y: 5 }
    window.alert = jest.fn();
  });

  afterEach(() => {
    snakeCat.stop();
    jest.clearAllTimers();
    jest.useRealTimers();
    window.alert = originalAlert;
  });

  it('Should create a snakecat', () => {
    const snakeCatParts = snakeCat.getSnakeCat();
    expect(snakeCat).toBeInstanceOf(SnakeCat);
    expect(snakeCatParts).toHaveLength(5);
    expect(snakeCatParts[0].getPart()).toBe(Part.HEAD);
    expect(snakeCatParts[1].getPart()).toBe(Part.BODY);
    expect(snakeCatParts[2].getPart()).toBe(Part.BODY);
    expect(snakeCatParts[3].getPart()).toBe(Part.BODY);
    expect(snakeCatParts[4].getPart()).toBe(Part.LEGS);
  });

  it('Should return the head', () => {
    const head = snakeCat.getHead();
    expect(head).toBeInstanceOf(SnakeCatPart);
    expect(head.getPart()).toBe(Part.HEAD);
    expect(head.getCoordinates()).toStrictEqual({ x: 5, y: 5 }); // Start cords are { x: 5, y: 5 } for this grid
  });

  it('Should move the snakecat up', () => {
    snakeCat.start();
    snakeCat.setDirection('ArrowUp');
    jest.advanceTimersByTime(tickTime);
    snakeCat.stop();
    let head = snakeCat.getHead();
    let tail = snakeCat.getTail();
    let body = snakeCat.getSnakeCat()[1];
    expect(head.getCoordinates()).toStrictEqual({ x: 5, y: 4 });
    expect(head.getPart()).toBe(Part.HEAD);
    expect(body.getPart()).toBe(Part.BODY);
    expect(tail.getPart()).toBe(Part.LEGS);
    expect(tail.getCoordinates()).toStrictEqual({ x: 5, y: 8 });
  });

  it('Should move the snakecat left', () => {
    snakeCat.start();
    snakeCat.setDirection('ArrowLeft');
    jest.advanceTimersByTime(tickTime);
    snakeCat.stop();
    let head = snakeCat.getHead();
    let tail = snakeCat.getTail();
    let body = snakeCat.getSnakeCat()[1];
    expect(head.getCoordinates()).toStrictEqual({ x: 4, y: 5 });
    expect(head.getPart()).toBe(Part.HEADLEFT);
    expect(body.getPart()).toBe(Part.TURNDOWNRIGHT);
    expect(tail.getPart()).toBe(Part.LEGS);
    expect(tail.getCoordinates()).toStrictEqual({ x: 5, y: 8 });
  });

  it('Should move the snakecat right', () => {
    snakeCat.start();
    snakeCat.setDirection('ArrowRight');
    jest.advanceTimersByTime(tickTime);
    snakeCat.stop();
    let head = snakeCat.getHead();
    let tail = snakeCat.getTail();
    let body = snakeCat.getSnakeCat()[1];
    expect(head.getCoordinates()).toStrictEqual({ x: 6, y: 5 });
    expect(head.getPart()).toBe(Part.LEGSRIGHT);
    expect(body.getPart()).toBe(Part.TURNDOWNLEFT);
    expect(tail.getPart()).toBe(Part.LEGS);
    expect(tail.getCoordinates()).toStrictEqual({ x: 5, y: 8 });
  });

  it('Should move the snakecat left and then down', () => {
    snakeCat.start();
    snakeCat.setDirection('ArrowLeft');
    jest.advanceTimersByTime(tickTime);
    snakeCat.setDirection('ArrowDown');
    jest.advanceTimersByTime(tickTime);
    snakeCat.stop();
    let head = snakeCat.getHead();
    let tail = snakeCat.getTail();
    let body = snakeCat.getSnakeCat()[1];
    expect(head.getCoordinates()).toStrictEqual({ x: 4, y: 6 });
    expect(head.getPart()).toBe(Part.LEGS);
    expect(body.getPart()).toBe(Part.TURNDOWNLEFT);
    expect(tail.getPart()).toBe(Part.LEGS);
    expect(tail.getCoordinates()).toStrictEqual({ x: 5, y: 7 });
  });

  it('Should not be able to double back and just move in the same direction', () => {
    snakeCat.start();
    snakeCat.setDirection('ArrowDown');
    jest.advanceTimersByTime(tickTime);
    snakeCat.stop();
    expect(snakeCat.getPosition()).toStrictEqual({ x: 5, y: 4 });
  });

  it('Should not move outside of 10x10 grid', () => {
    const snakeCat = new SnakeCat();
    snakeCat.start();
    jest.advanceTimersByTime(tickTime * 3);
    expect(snakeCat.getPosition()).toStrictEqual({ x: 5, y: 3 });
    jest.advanceTimersByTime(tickTime);
    expect(snakeCat.isDead()).toBe(true);
    expect(snakeCat.getPosition()).toStrictEqual({ x: 5, y: 3 });
  });

  it('Should not move the snakecat on top of it self and call game over', () => {
    expect(snakeCat.getPosition()).toStrictEqual({ x: 5, y: 5 });
    snakeCat.start();
    snakeCat.setDirection('ArrowLeft');
    jest.advanceTimersByTime(tickTime);
    expect(snakeCat.getPosition()).toStrictEqual({ x: 4, y: 5 });
    snakeCat.setDirection('ArrowDown');
    jest.advanceTimersByTime(tickTime);
    expect(snakeCat.getPosition()).toStrictEqual({ x: 4, y: 6 });
    snakeCat.setDirection('ArrowRight');
    jest.advanceTimersByTime(tickTime);
    snakeCat.stop();
    expect(snakeCat.getPosition()).toStrictEqual({ x: 4, y: 6 });
    expect(snakeCat.isDead()).toBe(true);
  });

  it('Should grow the snakecat by 1 when eating food and add new food', () => {
    const snakeCat = new SnakeCat({ x: 10, y: 10 });
    const foodCoordinate = { x: 4, y: 6 };
    snakeCat._food = foodCoordinate;
    expect(snakeCat.getSnakeCat().length).toBe(3);
    snakeCat.setDirection('ArrowLeft');
    snakeCat.start();
    jest.advanceTimersByTime(tickTime);
    snakeCat.stop();
    expect(snakeCat.getSnakeCat().length).toBe(4);
    expect(snakeCat._food).not.toStrictEqual(foodCoordinate);
  });

  it('Should call the draw function with cords and name, one time per part and ones for the food, when creating the snake', () => {
    const grid = { x: 10, y: 10 };
    const length = 3;
    const drawSpy = jest.fn();
    const snakeCat = new SnakeCat(grid, length, drawSpy);
    expect(drawSpy).toHaveBeenCalledTimes( 4 + 36 ); // 4 parts + 36 parts printing score and level
    expect(drawSpy).toHaveBeenCalledWith({ x: 5, y: 6 }, Part.HEAD.getName());
    expect(drawSpy).toHaveBeenCalledWith({ x: 5, y: 7 }, Part.BODY.getName());
    expect(drawSpy).toHaveBeenCalledWith({ x: 5, y: 8 }, Part.LEGS.getName());
    expect(drawSpy).toHaveBeenCalledWith(snakeCat._food, Part.LONGCAT.getName());
  });

  it('Should call the draw function four times when moving the snake (updating head and tail parts)', () => {
    const drawSpy = jest.fn();
    const snakeCat = new SnakeCat(grid, length, drawSpy);

    // Moving the food so it does not get eaten
    snakeCat._food = { x: 1, y: 1 };
    snakeCat.start();
    jest.advanceTimersByTime(tickTime);
    snakeCat.stop();
    // 5 parts + 1 food for creating the snake + 4 parts for moving the snake + 36 parts printing score and level 6x6
    expect(drawSpy).toHaveBeenCalledTimes(length + 1 + 4 + 36);
    const lastFourCalls = drawSpy.mock.calls.slice(-4);
    expect(lastFourCalls).toStrictEqual([
      [{ x: 5, y: 4 }, Part.HEAD.getName()],
      [{ x: 5, y: 5 }, Part.BODY.getName()],
      [{ x: 5, y: 8 }, Part.LEGS.getName()],
      [{ x: 5, y: 9 }, Part.BLANK.getName()]
    ]);
  });

  it('Should not move if the _direction is an invalid key', () => {
    snakeCat.start();
    snakeCat.setDirection('p');
    jest.advanceTimersByTime(tickTime);
    snakeCat.stop();
    expect(snakeCat.getPosition()).toStrictEqual({ x: 5, y: 5 });
  });

  it('Should animate game over when the snake dies', () => {
    const drawSpy = jest.fn();
    const snakeCat = new SnakeCat(grid, length, drawSpy);
    const timoutSpy = jest.spyOn(window, 'setTimeout');

    snakeCat.start();
    jest.advanceTimersByTime(tickTime * 30);
    expect(snakeCat.isDead()).toBe(true);
    expect(timoutSpy).toHaveBeenCalledTimes( GAME_OVER_ANIMATION.length);
  }); 
});

describe('SnakeCat - Eating Food', () => {
  let snakeCat;
  const grid = { x: 10, y: 10 };
  const length = 5;
  const tickTime = TICK_TIME;

  beforeEach(() => {
    snakeCat = new SnakeCat(grid, length);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('Count up the score when eating food and also count food eaten', () => {
    snakeCat._food = { x: 4, y: 5 };
    snakeCat.start();
    snakeCat.setDirection('ArrowLeft');
    jest.advanceTimersByTime(tickTime);
    snakeCat.stop();
    expect(snakeCat.getScore()).toBe(1);
    expect(snakeCat.getCollectedFood()).toBe(1);
  });

  it('should start at level 1 and gain 1 level when eating 5 food', () => {
    snakeCat._food = { x: 4, y: 5 };
    snakeCat._collectedFood = 4;
    snakeCat.start();
    expect(snakeCat.getLevel()).toBe(1);
    snakeCat.setDirection('ArrowLeft');
    jest.advanceTimersByTime(tickTime);
    expect(snakeCat.getLevel()).toBe(2);
  });

  it('should increase the speed when eating 5 food', () => {
    snakeCat._food = { x: 4, y: 5 };
    snakeCat._collectedFood = 4;
    snakeCat.start();
    expect(snakeCat.getSpeed()).toBe(TICK_TIME);
    snakeCat.setDirection('ArrowLeft');
    jest.advanceTimersByTime(tickTime);
    expect(snakeCat.getSpeed()).toBe(TICK_TIME - 50); // 50 is the speed increase 
  });

  it('should give higher score when eating food on higher level', () => {
    snakeCat._food = { x: 4, y: 5 };
    snakeCat._collectedFood = 4;
    snakeCat.start();
    snakeCat.setDirection('ArrowLeft');
    jest.advanceTimersByTime(tickTime);
    expect(snakeCat.getScore()).toBe(2);
  });

  it('should print the score when eating food', () => {
    const printSpy = jest.spyOn(snakeCat, 'printScore').mockImplementation(() => { });
    snakeCat._food = { x: 4, y: 5 };
    expect(snakeCat.getPosition()).toStrictEqual({ x: 5, y: 5 });
    snakeCat.start();
    snakeCat.setDirection('ArrowLeft');
    jest.advanceTimersByTime(tickTime);
    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});

