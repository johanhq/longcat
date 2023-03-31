import { Part, getHeightAndWidth, checkPart, updateMatrix, trimTrailingBlank, createEmojiString, checkByPath, getConnectingParts, createMatrix } from '../public/js/cat.js';

test('Test the height and width of a matrix', () => {
  const matrix = createMatrix( { x: 2, y: 3 } );
  const [H,W] = getHeightAndWidth( matrix );
  expect( H ).toBe(3);
  expect( W ).toBe(2);
});

test('Test to update a part of the matrix', () => {
  const matrix = createMatrix( { x: 3, y: 3 } );
  updateMatrix( { x: 1, y: 1 }, matrix)
  const [H,W] = getHeightAndWidth( matrix );
  expect( matrix[1][1] ).toBe( Part.LONGCAT );
});

describe('Testing what part we have', () => {
  const matrix =  createMatrix( { x: 5, y: 7 } );
  matrix[0][0] = Part.LONGCAT;
  matrix[0][3] = Part.HEAD;
  matrix[1][1] = Part.TURNDOWNLEFT;
  matrix[1][2] = Part.BODYHORIZONTAL;
  matrix[1][3] = Part.TURNLEFT;
  matrix[2][1] = Part.BODY;
  matrix[3][1] = Part.TURNRIGHT;
  matrix[3][2] = Part.TURNDOWNRIGHT;
  matrix[4][2] = Part.LEGS;
  matrix[6][1] = Part.HEADLEFT;
  matrix[6][2] = Part.LEGSRIGHT;

  test('Is it a head?', () => {
    expect( checkPart( 3, 0, matrix ) ).toBe( Part.HEAD );
  });

  test('Is it a head to the left?', () => {
    expect( checkPart( 1, 6, matrix ) ).toBe( Part.HEADLEFT );
  });

  test('Is it a lonely part it is a long cat?', () => {
    expect( checkPart( 0, 0, matrix ) ).toBe( Part.LONGCAT );
  });

  test('Is it the body?', () => { 
    expect( checkPart( 1, 2, matrix ) ).toBe( Part.BODY );
  });

  test('Is it the legs?', () => {
    expect( checkPart( 2, 4, matrix ) ).toBe( Part.LEGS );
  });

  test('Is it the legs to the right?', () => {
    expect( checkPart( 2, 6, matrix ) ).toBe( Part.LEGSRIGHT );
  });

  test('Are we turning left?', () => {
    expect( checkPart( 3, 1, matrix ) ).toBe( Part.TURNLEFT );
  });

  test('Are we turning right?', () => {
    expect( checkPart( 1, 3, matrix ) ).toBe( Part.TURNRIGHT );
  });

  test('Are we turning down left?', () => {
    expect( checkPart( 1, 1, matrix ) ).toBe( Part.TURNDOWNLEFT );
  });

  test('Are we turning down right?', () => {
    expect( checkPart( 2, 3, matrix ) ).toBe( Part.TURNDOWNRIGHT );
  });

  test('Can we go horizontal?', () => {
    expect( checkPart( 2, 1, matrix ) ).toBe( Part.BODYHORIZONTAL );
  });

  test('Is it a X?', () => {
    const matrix =  createMatrix( { x: 3, y: 3 } ); 
    matrix[0][1] = Part.HEAD;
    matrix[1][0] = Part.HEADLEFT;
    matrix[1][1] = Part.X;
    matrix[1][2] = Part.LEGSRIGHT;
    matrix[2][1] = Part.LEGS;
    expect( checkPart( 1, 1, matrix ) ).toBe( Part.X );
  });

  test('Is it a T to the left?', () => {
    const matrix =  createMatrix( { x: 3, y: 3 } ); 
    matrix[0][1] = Part.HEAD;
    matrix[1][1] = Part.TE;
    matrix[1][2] = Part.LEGSRIGHT;
    matrix[2][1] = Part.LEGS;
    expect( checkPart( 1, 1, matrix ) ).toBe( Part.TE );
  });

  test('Is it a T to the right?', () => {
    const matrix =  createMatrix( { x: 3, y: 3 } ); 
    matrix[0][1] = Part.HEAD;
    matrix[1][0] = Part.HEADLEFT;
    matrix[1][1] = Part.TV;
    matrix[2][1] = Part.LEGS;
    expect( checkPart( 1, 1, matrix ) ).toBe( Part.TV );
  });

  test('Is it a T at the top?', () => {
    const matrix =  createMatrix( { x: 3, y: 3 } );
    matrix[1][0] = Part.HEADLEFT;
    matrix[1][1] = Part.TS;
    matrix[1][2] = Part.LEGSRIGHT;
    matrix[2][1] = Part.LEGS;
    expect( checkPart( 1, 1, matrix ) ).toBe( Part.TS );
  });

  test('Is it a T at the bottom?', () => {
    const matrix =  createMatrix( { x: 3, y: 3 } );
    matrix[0][1] = Part.HEAD;
    matrix[1][0] = Part.HEADLEFT;
    matrix[1][1] = Part.TS;
    matrix[1][2] = Part.LEGSRIGHT;
    expect( checkPart( 1, 1, matrix ) ).toBe( Part.TN );
  });
});

test('Testing to trim an array', () => {
  const array = [Part.BLANK, Part.HEAD, Part.BLANK, Part.BLANK, Part.BLANK, Part.BLANK];
  expect( trimTrailingBlank( array ) ).toStrictEqual( [Part.BLANK, Part.HEAD] );
});

describe('Testing to create some nice emoji strings!', () => {
  test('A small long cat', () => {
    const matrix = createMatrix( { x: 3, y: 3 } );
    matrix[0][1] = Part.HEAD;
    matrix[1][1] = Part.BODY;
    matrix[2][1] = Part.LEGS;
    expect( createEmojiString( matrix ) ).toBe(':blank::longcat_is_long_1:\n:blank::longcat_is_long_2:\n:blank::longcat_is_long_3:');
  });

  test('A small long cat with emty lines', () => {
    const matrix = createMatrix( { x: 3, y: 5} );
    matrix[0][1] = Part.HEAD;
    matrix[1][1] = Part.BODY;
    matrix[2][1] = Part.LEGS;
    expect( createEmojiString( matrix ) ).toBe(':blank::longcat_is_long_1:\n:blank::longcat_is_long_2:\n:blank::longcat_is_long_3:');
  });
});

describe('Testing based on path', () => {
    test('Testing moving right', () => {
      expect( checkByPath( { x:1, y:1 }, { x:0, y:1 } ) ).toBe( Part.LEGSRIGHT );
    });

    test('Testing moving left', () => {
      expect( checkByPath( { x:0, y:1 }, { x:1, y:1 } ) ).toBe( Part.HEADLEFT );
    });

    test('Testing moving up', () => {
      expect( checkByPath( { x:1, y:0 }, { x:1, y:1 } ) ).toBe( Part.HEAD );
    });

    test('Testing moving down', () => {
      expect( checkByPath( { x:1, y:1 }, { x:1, y:0 } ) ).toBe( Part.LEGS );
    });
});

describe('Testing based on connecting parts', () => {
  test('All by my self in the matrix', () => {
    const matrix = createMatrix( { x: 1, y: 1 } );
    expect( getConnectingParts( 0, 0, matrix ) ).toStrictEqual( { n: Part.BLANK, s: Part.BLANK, v: Part.BLANK, e: Part.BLANK } );
  });

  test('All my friends and me in the matrix', () => {
    const matrix = createMatrix( { x: 3, y: 3 } );
    matrix[0][1] = Part.HEAD;
    matrix[1][2] = Part.HEAD;
    matrix[2][1] = Part.LEGS;
    expect( getConnectingParts( 1, 1, matrix ) ).toStrictEqual( { n: Part.HEAD, s: Part.LEGS, v: Part.BLANK, e: Part.HEAD } );
  });
});