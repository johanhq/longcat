const Part = Object.freeze({ 
    BLANK: 0, 
    HEAD: 1, 
    LEGS: 2, 
    BODY: 3, 
    TURNLEFT: 4, 
    TURNRIGHT: 5,
    TURNDOWNLEFT: 6, 
    TURNDOWNRIGHT: 7,
    BODYHORIZONTAL: 8,
    LEGSRIGHT: 9,
    HEADLEFT: 10,
    LONGCAT: 11,
});

const Img = []; 
Img[Part.BLANK] = 'blank'; 
Img[Part.HEAD] = 'longcat_is_long_1';
Img[Part.HEADLEFT] = 'longcat_is_long_1_2';
Img[Part.LEGS] = 'longcat_is_long_3'; 
Img[Part.LEGSRIGHT] = 'longcat_is_long_3_2';
Img[Part.BODY] = 'longcat_is_long_2'; 
Img[Part.TURNLEFT] = 'longcat_is_long_2_turnleft'; 
Img[Part.TURNRIGHT] = 'longcat_is_long_2_turnright'; 
Img[Part.TURNDOWNLEFT] = 'longcat_is_long_2_downleft'; 
Img[Part.TURNDOWNRIGHT] = 'longcat_is_long_2_downright'; 
Img[Part.BODYHORIZONTAL] = 'longcat_is_long_2_right';
Img[Part.LONGCAT] = 'long_cat';

const parseMatrix = ( stringMatrix ) => {
   const rows = stringMatrix.split('\n');
   return rows.filter( row => row.length > 0 ).map( row => row.trim().split('') );
}

const getHeightAndWidth = matrix => {
    const H = matrix.length;
    const W = matrix[0].length;
    return [H,W]
}

const outOfBounce = ( X, Y, [ H, W ] ) => X < 0 || X >= W || Y < 0 || Y >= H;

const isCat = ( X, Y, matrix) => {
    if ( outOfBounce( X, Y, getHeightAndWidth(matrix) ) ) {
        return false;
    } else if( matrix[Y][X] != Part.BLANK ) {
        return true;
    }
    return false;
}

const CONNECTING_SOUTH = [ Part.HEAD, Part.BODY, Part.TURNDOWNLEFT, Part.TURNDOWNRIGHT ];
const CONNECTING_NORTH = [ Part.BODY, Part.LEGS, Part.TURNLEFT, Part.TURNRIGHT ];
const CONNECTING_VEST = [ Part.BODYHORIZONTAL, Part.TURNDOWNRIGHT, Part.TURNLEFT, Part.LEGSRIGHT ];
const CONNECTING_EAST = [ Part.BODYHORIZONTAL, Part.TURNDOWNLEFT, Part.TURNRIGHT, Part.HEADLEFT];

const NO_CONNECTION_SOUTH = [ Part.BLANK, Part.LEGS, Part.TURNLEFT, Part.TURNRIGHT, Part.BODYHORIZONTAL, Part.LEGSRIGHT, Part.HEADLEFT ];
const NO_CONNECTION_NORTH = [ Part.BLANK, Part.HEAD, Part.TURNDOWNLEFT, Part.TURNDOWNRIGHT, Part.BODYHORIZONTAL, Part.LEGSRIGHT, Part.HEADLEFT ];
const NO_CONNECTION_VEST = [ Part.BLANK, Part.HEAD, Part.BODY, Part.LEGS, Part.TURNDOWNLEFT, Part.TURNRIGHT, Part.HEADLEFT ];
const NO_CONNECTION_EAST = [ Part.BLANK, Part.HEAD, Part.BODY, Part.LEGS, Part.TURNDOWNRIGHT, Part.TURNLEFT, Part.LEGSRIGHT ];


const isLongcat = ( { n, s, v, e } ) => NO_CONNECTION_SOUTH.includes( n ) &&
    NO_CONNECTION_VEST.includes( e ) &&
    NO_CONNECTION_NORTH.includes( s ) &&
    NO_CONNECTION_EAST.includes( v );

const isHead = ( { n, s, v, e } ) => NO_CONNECTION_SOUTH.includes( n ) &&
    NO_CONNECTION_VEST.includes( e ) &&
    CONNECTING_NORTH.includes( s ) &&
    NO_CONNECTION_EAST.includes( v );

const isHeadLeft = ( { n, s, v, e } ) => NO_CONNECTION_SOUTH.includes( n ) &&
    CONNECTING_VEST.includes( e ) &&
    NO_CONNECTION_NORTH.includes( s ) &&
    NO_CONNECTION_EAST.includes( v );


const isBody = ( { n, s, v, e } ) => CONNECTING_SOUTH.includes( n ) &&
    NO_CONNECTION_VEST.includes( e ) &&
    CONNECTING_NORTH.includes( s ) &&
    NO_CONNECTION_EAST.includes( v );

const isLegs = ( { n, s, v, e } ) => CONNECTING_SOUTH.includes( n ) &&
    NO_CONNECTION_VEST.includes( e ) &&
    NO_CONNECTION_NORTH.includes( s ) &&
    NO_CONNECTION_EAST.includes( v )    
    
const isLegsRight = ( { n, s, v, e } ) => NO_CONNECTION_SOUTH.includes( n ) &&
    NO_CONNECTION_VEST.includes( e ) &&
    NO_CONNECTION_NORTH.includes( s ) &&
    CONNECTING_EAST.includes( v )       

const isTurnLeft = ( { n, s, v, e } ) => CONNECTING_SOUTH.includes( n ) &&
    NO_CONNECTION_VEST.includes( e ) &&
    NO_CONNECTION_NORTH.includes( s ) &&
    CONNECTING_EAST.includes( v )     

const isTurnRight = ( { n, s, v, e } ) => CONNECTING_SOUTH.includes( n ) &&
    CONNECTING_VEST.includes( e ) &&
    NO_CONNECTION_NORTH.includes( s ) &&
    NO_CONNECTION_EAST.includes( v )     

const isTurnDownLeft = ( { n, s, v, e } ) => NO_CONNECTION_SOUTH.includes( n ) 
    && CONNECTING_VEST.includes( e )
    && CONNECTING_NORTH.includes( s )
    && NO_CONNECTION_EAST.includes( v ); 

const isTurnDownRight = ( { n, s, v, e } ) => NO_CONNECTION_SOUTH.includes( n )
    && NO_CONNECTION_VEST.includes( e )
    && CONNECTING_NORTH.includes( s )
    && CONNECTING_EAST.includes( v )

const isHorizontal = ( { n, s, v, e } ) => NO_CONNECTION_SOUTH.includes( n )
    && CONNECTING_VEST.includes( e )
    && NO_CONNECTION_NORTH.includes( s )
    && CONNECTING_EAST.includes( v )

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
const checkPart = ( X, Y, matrix ) => {
    let connects = getConnectingParts( X, Y, matrix);
    if (isLongcat( connects )) {
        return Part.LONGCAT;
    } else if ( isHead( connects ) ) {
        return Part.HEAD;
    } else if ( isHeadLeft( connects ) ) {
        return Part.HEADLEFT;         
    } else if ( isLegsRight( connects ) ) {
        return Part.LEGSRIGHT;
    } else if ( isBody( connects ) ) {
        return Part.BODY;
    } else if ( isLegs( connects ) ) {
        return Part.LEGS;
    } else if ( isTurnLeft( connects ) ) {
        return Part.TURNLEFT;
    } else if ( isTurnRight( connects ) ) {
        return Part.TURNRIGHT;
    } else if ( isTurnDownLeft( connects ) ) {
        return Part.TURNDOWNLEFT;
    } else if ( isTurnDownRight( connects ) ) {
        return Part.TURNDOWNRIGHT;
    } else if ( isHorizontal( connects ) ) {
        return Part.BODYHORIZONTAL;
    }
    
    return Part.BLANK;
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

const lastNonBlank = ( element ) => element !== Part.BLANK;

const trimTrailingBlank = ( array ) => array.slice( 0, array.findLastIndex( lastNonBlank ) + 1 );

const createEmojiString = matrix => {
    let trimmed = matrix.map( row => trimTrailingBlank( row ).map( part => `:${Img[part]}:`).join('') );
    return trimmed.slice( 0, trimmed.findLastIndex( row => row.length ) + 1 ).join('\n');
}

export { Part, Img, parseMatrix, getHeightAndWidth, isCat, checkPart, trimTrailingBlank, createEmojiString, checkByPath, getConnectingParts }