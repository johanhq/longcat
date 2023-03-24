import { Part, parseMatrix, getHeightAndWidth, isCat, checkPart, trimTrailingBlank, createEmojiString, checkByPath, getConnectingParts } from '../public/js/cat.js';

test('Test to parse a matrix', () => {
    const matrix = `00\n00` 
    expect( parseMatrix(matrix).length ).toBe(2);
  });

  test('Test the height and width of a matrix', () => {
    const matrixString = `00\n00\n00` 
    const matrix = parseMatrix( matrixString );
    const [H,W] = getHeightAndWidth( matrix );
    expect( H ).toBe(3);
    expect( W ).toBe(2);
  });

describe('Testing if it is a cat', () => {
  const matrixString = `000\n0C0\n000` 
  test('Check if it is out of bounderies for a 3x3 matrix', () => {
    const matrix = parseMatrix( matrixString );
    expect( isCat( -1, 0, matrix ) ).toBeFalsy();
    expect( isCat( 3, 0, matrix ) ).toBeFalsy();
    expect( isCat( 0, -1, matrix ) ).toBeFalsy();
    expect( isCat( 0, 3, matrix ) ).toBeFalsy();
  });
  
  test('Check if the cat is a cat', () => {
    const matrix = parseMatrix( matrixString );
    expect( isCat( 1, 1, matrix ) ).toBeTruthy();
  });

  test('Check if a blank is not a cat', () => {
    const matrix = parseMatrix( matrixString );
    expect( isCat( 0, 0, matrix ) ).toBeFalsy();
  });
});

describe('Testing what part we have', () => {

  const matrix = [
    [1,0,0,1,0],
    [0,6,8,4,0],
    [0,3,0,0,0],
    [0,5,7,0,0],
    [0,0,2,0,0]
  ]; 

  test('Is it a head?', () => {
    expect( checkPart( 3, 0, matrix ) ).toBe( Part.HEAD );
  });

  test('Is it a lonely head is a head?', () => {
    expect( checkPart( 0, 0, matrix ) ).toBe( Part.HEAD );
  });

  test('Is it the body?', () => { 
    expect( checkPart( 1, 2, matrix ) ).toBe( Part.BODY );
  });

  test('Is it the legs?', () => {
    expect( checkPart( 2, 4, matrix ) ).toBe( Part.LEGS );
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

  test('Is it a head?', () => {
    const advancedMatrix = [
      [0,1,0],
      [0,3,0],
      [0,2,0]
    ];
    expect( checkPart( 1, 0, advancedMatrix, true ) ).toBe( Part.HEAD );
  });

  test('Is it the body?', () => {
    const advancedMatrix = [
      [0,1,0],
      [0,0,0],
      [0,2,0]
    ];
    expect( checkPart( 1, 1, advancedMatrix, true ) ).toBe( Part.BODY );
  });

  test('Is it the legs?', () => {
    const advancedMatrix = [
      [0,0,0],
      [0,1,0],
      [0,0,0]
    ];
    expect( checkPart( 1, 2, advancedMatrix, true ) ).toBe( Part.LEGS );
  });

});

test('Testing to trim an array', () => {
  const array = [Part.BLANK, Part.HEAD, Part.BLANK, Part.BLANK, Part.BLANK, Part.BLANK];
  expect( trimTrailingBlank( array ) ).toStrictEqual( [Part.BLANK, Part.HEAD] );
});

describe('Testing to create some nice emoji strings!', () => {
  test('A small long cat', () => {
    const matrix = [
      [0,1,0],
      [0,3,0],
      [0,2,0]
    ];
    expect( createEmojiString( matrix ) ).toBe(':blank::longcat_is_long_1:\n:blank::longcat_is_long_2:\n:blank::longcat_is_long_3:');
  });
});

describe('Testing based on path', () => {
    test('Testing moving right', () => {
      expect( checkByPath( { x:1, y:1 }, { x:0, y:1 } ) ).toBe( Part.BODYHORIZONTAL );
    });

    test('Testing moving left', () => {
      expect( checkByPath( { x:0, y:1 }, { x:1, y:1 } ) ).toBe( Part.BODYHORIZONTAL );
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
    const matrix = [[1]];
    expect( getConnectingParts( 0, 0, matrix ) ).toStrictEqual( { n: Part.BLANK, s: Part.BLANK, v: Part.BLANK, e: Part.BLANK } );
  });

  test('All my friends and me in the matrix', () => {
    const matrix = [
      [0,1,0],
      [0,3,1],
      [0,2,0]
    ];
    expect( getConnectingParts( 1, 1, matrix ) ).toStrictEqual( { n: Part.HEAD, s: Part.LEGS, v: Part.BLANK, e: Part.HEAD } );
  });
});