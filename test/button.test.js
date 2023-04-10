/**
 * @jest-environment jsdom
 */

import { bindButtonClickEvent, bindButtonMouseDownEvent, bindButtonMouseLeaveEvent, initButtons } from '../public/js/button.js';
import { Button } from '../public/js/drawingSurface.js';
import { jest } from '@jest/globals';
import 'jest-canvas-mock';

describe('bindButtonClickEvent', () => {
    let button;
    let onClick;

    beforeEach(() => {
        button = new Button('button');
        onClick = jest.fn();
    });

    test('calls onClick callback when button is clicked', () => {
        bindButtonClickEvent(button, onClick);
        expect(onClick).not.toHaveBeenCalled();
        button.getButton().click();
        expect(onClick).toHaveBeenCalled();
    });
});

describe('bindButtonMouseDownEvent', () => {
    let button;

    beforeEach(() => {
        button = new Button('button');
    });

    test('calls onClick callback when button is clicked', () => {
        bindButtonMouseDownEvent(button);
        expect(button.getButton().classList.contains('active')).toBe(false);
        button.getButton().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(button.getButton().classList.contains('active')).toBe(true);
    });
});

describe('bindButtonMouseLeaveEvent', () => {
    let button;

    beforeEach(() => {
        button = new Button('button', 'test', true);
    });

    test('calls onClick callback when button is clicked', () => {
        bindButtonMouseLeaveEvent(button);
        expect(button.getButton().classList.contains('active')).toBe(true);
        button.getButton().dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        expect(button.getButton().classList.contains('active')).toBe(false);
    });
});

describe('initButtons', () => {
    let buttons;
    let printFn;
    let eraseFn;
    let refreshFn;

    Object.assign(navigator, {
        clipboard: {
            writeText: () => { },
        },
    });

    beforeEach(() => {
        buttons = {
            eraser: new Button('eraser'),
            pen: new Button('pen', 'test', true),
            refresh: new Button('refresh'),
            copy: new Button('copy')
        };
        printFn = jest.fn(() => 'test');
        eraseFn = jest.fn();
        refreshFn = jest.fn();
    });

    test('binds click events to buttons', () => {
        initButtons(buttons, printFn, eraseFn, refreshFn);
        buttons.eraser.getButton().click();
        expect(eraseFn).toHaveBeenCalledTimes(1);
        expect(eraseFn).toHaveBeenCalledWith(true);
        buttons.pen.getButton().click();
        expect(eraseFn).toHaveBeenCalledTimes(2);
        expect(eraseFn).toHaveBeenCalledWith(false);
        buttons.refresh.getButton().click();
        expect(refreshFn).toHaveBeenCalledTimes(1);
        buttons.copy.getButton().click();
        expect(printFn).toHaveBeenCalledTimes(1);
    });

    test('binds mouse down events to buttons', () => {
        initButtons(buttons, printFn, eraseFn, refreshFn);
        buttons.refresh.getButton().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        buttons.copy.getButton().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(buttons.refresh.isActive()).toBe(true);
        expect(buttons.copy.isActive()).toBe(true);
    });

    test('binds mouse leave events to buttons', () => {
        initButtons(buttons, printFn, eraseFn, refreshFn);
        buttons.refresh.getButton().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        buttons.copy.getButton().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(buttons.refresh.isActive()).toBe(true);
        expect(buttons.copy.isActive()).toBe(true);
        buttons.refresh.getButton().dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        buttons.copy.getButton().dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        expect(buttons.refresh.isActive()).toBe(false);
        expect(buttons.copy.isActive()).toBe(false);
    });

    test('So pen and erasor are active', () => {
        initButtons(buttons, printFn, eraseFn, refreshFn);
        expect(buttons.eraser.isActive()).toBe(false);
        expect(buttons.pen.isActive()).toBe(true);
        buttons.eraser.getButton().click();
        expect(buttons.eraser.isActive()).toBe(true);
        expect(buttons.pen.isActive()).toBe(false);
    });
});







