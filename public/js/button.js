export const bindButtonClickEvent = (button, onClick) => {
    button.getButton().addEventListener('click', () => {
      onClick();
    });
};

export const bindButtonMouseDownEvent = (button) => {
    button.getButton().addEventListener('mousedown', () => button.setActive(true));
}

export const bindButtonMouseLeaveEvent = (button) => {
    button.getButton().addEventListener('mouseleave', () => button.setActive(false));
}

export const initButtons = ( buttons, printFn, eraseFn, refreshFn) => {
    const { eraser, pen, refresh, copy } = buttons;

    bindButtonClickEvent(eraser, () => {
        eraser.setActive(true);
        pen.setActive(false); 
        eraseFn( true );
    });

    bindButtonClickEvent(pen, () => {
        pen.setActive(true);
        eraser.setActive(false);
        eraseFn( false );
    });

    bindButtonClickEvent(refresh, refreshFn);

    bindButtonClickEvent(copy, () => {
        navigator.clipboard.writeText(printFn());
    });

    [refresh, copy].forEach(button => {
        bindButtonMouseDownEvent(button);
        bindButtonMouseLeaveEvent(button);
    });
};