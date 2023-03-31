class PartObj {
  constructor ( id, name, { N = false, E = false, S = false, V = false } ) {
    this.id = id;
    this.name = name;
    this.N = N;
    this.E = E;
    this.S = S;
    this.V = V;
  }
}

const N = 1, E = 1, S = 1, V = 1; 

const Part = {
    BLANK: new PartObj( 0, 'blank', {}),
    HEAD: new PartObj( 1, 'longcat_is_long_1', { S }),
    LEGS: new PartObj( 2, 'longcat_is_long_3', { N }),
    BODY: new PartObj( 3, 'longcat_is_long_2', { N, S }),
    TURNLEFT: new PartObj( 4, 'longcat_is_long_2_turnleft', { N, V }), 
    TURNRIGHT: new PartObj( 5, 'longcat_is_long_2_turnright', { N, E }),
    TURNDOWNLEFT: new PartObj( 6, 'longcat_is_long_2_downleft', { E, S }), 
    TURNDOWNRIGHT: new PartObj( 7, 'longcat_is_long_2_downright', { S, V }),
    BODYHORIZONTAL: new PartObj( 8, 'longcat_is_long_2_right', { E, V }),
    LEGSRIGHT: new PartObj( 9, 'longcat_is_long_3_2', { V }),
    HEADLEFT: new PartObj( 10, 'longcat_is_long_1_2', { E }),
    LONGCAT: new PartObj( 11, 'long_cat', {}),
    X: new PartObj( 12, 'longcat_is_long_X', { N, E ,S, V}),
    TE: new PartObj( 13, 'longcat_is_long_T_E', { N, E, S }),
    TV: new PartObj( 14, 'longcat_is_long_T_V', { N, S, V }),
    TN: new PartObj( 15, 'longcat_is_long_T_N', { N, E, V }),
    TS: new PartObj( 16, 'longcat_is_long_T_S', { E, S, V })
};

const createMatrix = ( {x, y} ) => {
    let rows = new Array( y ).fill();
    return rows.map( () => new Array( x ).fill(Part.BLANK));
}

const getHeightAndWidth = matrix => {
    const H = matrix.length;
    const W = matrix[0].length;
    return [H,W]
}

const outOfBounce = ( X, Y, [ H, W ] ) => X < 0 || X >= W || Y < 0 || Y >= H;

const getPart = ( x, y, HW, matrix) => outOfBounce( x, y, HW ) ? Part.BLANK : matrix[ y ][ x ];

const getConnectingParts = ( x, y, matrix) => {
    const HW = getHeightAndWidth(matrix);
    return {
        n: getPart( x, y-1, HW, matrix),
        s: getPart( x, y+1, HW, matrix),
        v: getPart( x-1, y, HW, matrix),
        e: getPart( x+1, y, HW, matrix),
    }
}

const updateMatrix = ( { x, y }, matrix ) => {
    matrix[y][x] = checkPart( x, y, matrix);
}

const checkPart = ( X, Y, matrix ) => {
    let { n, s, v, e } = getConnectingParts( X, Y, matrix);
    let thePart = Object.values(Part).find( part => part.N === n.S && part.E === e.V && part.S === s.N && part.V === v.E && part.id > 0);
    return thePart ? thePart : Part.BLANK;
}

const checkByPath = ( part, lastPart ) => {
    if ( part.x > lastPart.x ) {
        return Part.LEGSRIGHT;
    } else if ( part.x < lastPart.x ) {
        return Part.HEADLEFT;
    } else if ( part.y > lastPart.y ) {
        return Part.LEGS;
    } else if ( part.y < lastPart.y ) {
        return Part.HEAD;
    }
} 

const lastNonBlank = ( part ) => part !== Part.BLANK;

const trimTrailingBlank = ( array ) => array.slice( 0, array.findLastIndex( lastNonBlank ) + 1 );



const createEmojiString = matrix => {
    let trimmed = matrix.map( row => trimTrailingBlank( row ).map( part => `:${part.name}:`).join('') );
    return trimmed.slice( 0, trimmed.findLastIndex( row => row.length ) + 1 ).join('\n');
}

export { Part, getHeightAndWidth, checkPart, trimTrailingBlank, createEmojiString, checkByPath, getConnectingParts, createMatrix, updateMatrix }