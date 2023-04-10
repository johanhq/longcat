class PartObj {
  constructor ( id, name, { N = 0, E = 0, S = 0, V = 0 } ) {
    this.id = id;
    this.name = name;
    this.N = N;
    this.E = E;
    this.S = S;
    this.V = V;
  }
  getConnections () {
    return {
      n: this.N,
      s: this.S,
      v: this.V,
      e: this.E
    }
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

const createMatrix = ( { x: cols, y: rows } ) => {
    let matrix = Array.from( { length: rows }, () => Array.from( { length: cols }, () => Part.BLANK ) );
    return matrix
}

const getHeightAndWidth = matrix => {
    const H = matrix.length;
    const W = matrix[0].length;
    return [H,W]
}

const outOfBounce = ( X, Y, [ H, W ] ) => X < 0 || X >= W || Y < 0 || Y >= H;

const getPart = ( x, y, HW, matrix) => outOfBounce( x, y, HW ) ? Part.BLANK : matrix[ y ][ x ];

const findConnections = ( x, y, matrix) => {
    const HW = getHeightAndWidth(matrix);
    return {
        n: getPart( x, y-1, HW, matrix).S,
        s: getPart( x, y+1, HW, matrix).N,
        v: getPart( x-1, y, HW, matrix).E,
        e: getPart( x+1, y, HW, matrix).V,
    }
}

const updateMatrix = ( matrix, { x, y } ) => {
    let part = checkPart( x, y, matrix);
    matrix[y][x] = part;
    return part;
}

const compareConnections = ( connections, part ) => {
    return JSON.stringify( connections ) === JSON.stringify( part.getConnections() ) && part.id > 0;
}

const checkPart = ( X, Y, matrix, override = {}) => {
    let connections = findConnections( X, Y, matrix );
    Object.assign( connections, override );
    let thePart = Object.values(Part).find( part => compareConnections( connections, part ));
    return thePart ? thePart : Part.BLANK;
}

const checkDirection = ( part, lastPart ) => {
    let deltaX = part.x - lastPart.x;
    let deltaY = part.y - lastPart.y;
    if( Math.abs(deltaX) > Math.abs(deltaY) ) {
        return deltaX > 0 ? {v:1} : {e:1}; 
    } else if ( Math.abs(deltaX) < Math.abs(deltaY) ){
        return deltaY > 0 ? {n:1} : {s:1}; 
    }
    return {};
}

const updateMatrixByPath = ( matrix, part, lastPart ) => {
    let pathPart = checkPart( part.x, part.y, matrix, checkDirection( part, lastPart ) );
    matrix[ part.y ][ part.x ] = pathPart;
    return pathPart;
}

const resetPart = ( matrix, part ) => {
    matrix[ part.y ][ part.x ] = Part.BLANK;
}

const lastNonBlank = ( part ) => part !== Part.BLANK;

const trimTrailingBlank = ( array ) => array.slice( 0, array.findLastIndex( lastNonBlank ) + 1 );

const createEmojiString = matrix => {
    let trimmed = matrix.map( row => trimTrailingBlank( row ).map( part => `:${part.name}:`).join('') );
    return trimmed.slice( 0, trimmed.findLastIndex( row => row.length ) + 1 ).join('\n');
}

export { Part, getHeightAndWidth, checkPart, trimTrailingBlank, createEmojiString, createMatrix, updateMatrix, updateMatrixByPath, resetPart, findConnections, compareConnections, checkDirection }