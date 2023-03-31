import { checkPart, createEmojiString, Part, checkByPath, createMatrix } from './cat.js';

const setBackground = ( canvas, context ) => {
    context.fillStyle = 'rgb(76, 81, 92)';
    context.fillRect(0,0,canvas.width, canvas.height);
}

const position = ( cordinate, size ) => cordinate * size + cordinate;

const createGrid = ( grid, context) => {
    context.fillStyle = 'rgb(34,37,41)';
    let size = grid.size;
    for( let j = 0; j < grid.y; j++) {
        for (let i = 0; i < grid.x; i++ ){
            context.fillRect( position( i, size ) , position( j, size ), size, size);
        }
    }
}

const refresh = ( canvas, grid ) => {
    setBackground( canvas, canvas.getContext("2d") );
    createGrid( grid, canvas.getContext("2d") );
}

const gridPos = ( N, { size } ) => Math.floor(N / ( size +1 ));

const initCanvas = ( canvas, grid ) => {
    const context = canvas.getContext("2d");
    canvas.height = grid.y * grid.size + grid.y;
    canvas.width = grid.x * grid.size + grid.x;

    let images = Object.values( Part ).reduce( ( imgs, part ) => {
        imgs[ part.name ] = createImage( part.name );
        return imgs;
    }, {} );

    refresh( canvas, grid )

    let matrix = createMatrix( grid );

    let drawing = false;
    let erase = false;

    function startDrawing(e) {
        drawing = true;
        draw(e);
    }

    function endDrawing(e) {
        drawing = false;
        lastPart = { x: -1, y: -1 };
    }
    
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect(),
          scaleX = canvas.width / rect.width,
          scaleY = canvas.height / rect.height;
        
        return {
          mx: (evt.clientX - rect.left) * scaleX,
          my: (evt.clientY - rect.top) * scaleY
        }
    }
        
    const addImage = ( {x, y} ) => {
        let size = grid.size;
        let name = matrix[ y ][ x ].name;
        context.fillRect( position( x, size ), position( y, size ), size, size);        
        context.drawImage( images[ name ], position( x, size ), position( y, size ), size, size);
    }

    let lastPart = { x:-1, y:-1 }
    function draw(e) {
        if ( !drawing ) return;
        
        if ( erase ) return eraseImg( e );

        let { mx, my } = getMousePos(canvas, e);
        let x = gridPos( mx, grid ), y = gridPos( my, grid );
        if (( lastPart.x !== x || lastPart.y !== y)) {
            if (lastPart.x >= 0 && lastPart.y >= 0 ) {
                matrix[ y ][ x ] = checkByPath( { x, y }, lastPart );
                matrix[ lastPart.y ][ lastPart.x ] = checkPart( lastPart.x, lastPart.y, matrix );
                addImage( {x, y} );
                addImage( lastPart );
            } else {
                matrix[ y ][ x ] = checkPart( x, y, matrix );
                addImage( {x, y} );
            }
            lastPart = { x, y };            
        }
    }

    const eraseImg = ( e ) => {
        let size = grid.size;
        let { mx, my } = getMousePos(canvas, e);
        let x = gridPos( mx, grid ), y = gridPos( my, grid );
        matrix[ y ][ x ] = Part.BLANK;
        context.fillRect( position( x, size ) , position( y, size ), size, size); 
    }
    
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", endDrawing);

    let eraserElm = document.querySelector('#eraser'); 
    let penElm = document.querySelector('#pen'); 
    eraserElm.addEventListener('click', () => {
        eraserElm.classList.toggle('active');
        penElm.classList.toggle('active');
        erase = true;
    });

    penElm.addEventListener('click', () => {
        penElm.classList.toggle('active');
        eraserElm.classList.toggle('active');
        erase = false;
    });

    let refreshElm = document.querySelector('#refresh');
    refreshElm.addEventListener('click', () => {
        refresh( canvas, grid );
        matrix = createMatrix( grid );  
    });
    refreshElm.addEventListener( 'mousedown', () => setActive( refreshElm ) );
    refreshElm.addEventListener( 'mouseup', () => setActive( refreshElm ) );

    let copyElm = document.querySelector('#copy');
    copyElm.addEventListener('click', () => {
        navigator.clipboard.writeText( createEmojiString( matrix ) );
    });
    copyElm.addEventListener( 'mousedown', () => setActive( copyElm ) );
    copyElm.addEventListener( 'mouseup', () => setActive( copyElm ) );
}

const setActive = ( elm ) => {
    elm.classList.toggle('active');
};

const createImage = ( name ) => {
    const img = new Image();
    img.src = `img/${name}.png`;
    return img; 
}

(() => {
    window.onload = () => {
        const grid = { x:20, y:20, size: 30}
        const canvas = document.getElementById("canvas");
        initCanvas( canvas, grid );
    }
})();
