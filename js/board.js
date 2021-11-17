var ctx;
var bctx;

var files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
var ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
var rankFileBounds = new Map();

var currTask = ['a', ''];
var boardBounds = [[0, 0],[0,0]];
var squareWidth = 0;

var settings = [false, false];

function init() 
{
    window.addEventListener('resize', load);

    window.addEventListener('mousedown', clickEvent);
    window.addEventListener('mouseup', initBoard);

    window.addEventListener('touchstart', touchEvent, { passive: false });
    window.addEventListener('touchend', initBoard);

    load();
    nextTask(settings[0], settings[1]);
    setVisualTask();
    
};                                                  

function initCanvas()
{
    const canvas = document.getElementById('canvas');
    const bufferCanvas = document.createElement('canvas');

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    var dpr = window.devicePixelRatio || 1;

    ctx = canvas.getContext('2d');
    bctx = bufferCanvas.getContext('2d');

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    bufferCanvas.width = width * dpr;
    bufferCanvas.height = height * dpr;


    scale = dpr;
    bctx.scale(scale, scale);

    bctx.fillStyle = 'rgb(41, 40, 40)';
    bctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgb(41, 40, 40)';
    ctx.fillRect(0, 0, width, height);

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
};

function initBoard()
{
    bctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    bctx.fillStyle = 'rgb(41, 40, 40)';
    bctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // darkColor = 'rgb(41, 40, 40)'; // Grey
    // darkColor = 'rgb(211, 134, 155)'; // Purple
    darkColor = 'rgb(114, 41, 62)'; // Darker Purple
    // darkColor = 'rgb(169, 182, 101)'; // Green
    // darkColor = 'rgb(234, 105, 98)'; // Red
    lightColor = 'rgb(212, 190, 152)'; // Beige

    margin = window.innerHeight/10;
    squareWidth = (Math.min(window.innerWidth, window.innerHeight - 2*margin))/8;

    leftOffset = (window.innerWidth > window.innerHeight - 2*margin) ? (window.innerWidth - window.innerHeight + 2*margin)/2 : 0;
    topOffset = (window.innerWidth > window.innerHeight - 2*margin) ? margin : (window.innerHeight - window.innerWidth)/2;

    boardBounds = [[leftOffset, leftOffset + 8*squareWidth], [topOffset, topOffset + 8*squareWidth]];

    for (var xx = 0; xx < 8; xx++) 
    {
        for (var yy = 0; yy < 8; yy++)
        {
            bctx.fillStyle = ((xx + yy) % 2 == 1) ? darkColor : lightColor;

            xpos = leftOffset + xx*squareWidth;
            ypos = topOffset + yy*squareWidth;

            bctx.fillRect(xpos, ypos, squareWidth + 1, squareWidth + 1); // + 1 to fix borders

            if (xx == 0) 
            {
                rankFileBounds.set(ranks[yy], [ypos, ypos + squareWidth]);
            }

            if (yy == 0) 
            {
                rankFileBounds.set(files[xx], [xpos, xpos + squareWidth]);
            }
        }
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.drawImage(bctx.canvas, 0, 0);

    console.log('boardInit');
}

function load() 
{
    initCanvas();
    initBoard();
}

async function clickEvent( e )
{

    window.removeEventListener('mousedown', clickEvent);

    console.log('click-event');

    xpos = e.clientX;
    ypos = e.clientY;

    // Condition: click is within the bounds of the board
    if (xpos > boardBounds[0][0] && xpos < boardBounds[0][1] && ypos > boardBounds[1][0] && ypos < boardBounds[1][1] )
    {
        highlightSquare( xpos, ypos );

        if (isCorrect(xpos, ypos)) 
        {
            nextTask(settings[0], settings[1]);

        } else {

            document.getElementById('currTask').style.color = 'rgb(234, 105, 98)';
            await new Promise(r => setTimeout(r, 1000));
            // reset task text color
            document.getElementById('currTask').style.color = 'white';
            nextTask(settings[0], settings[1]);
        }
        

    } else {

        console.log('not on board');

    }

    window.addEventListener('mousedown', clickEvent);
    window.addEventListener('touchstart', touchEvent, { passive: false });
}

async function touchEvent( e )
{
    window.removeEventListener('touchstart', touchEvent, { passive: false });
    console.log('touch event');
    
    // Get coordinates from touch object
    let newE = {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY};
    clickEvent(newE);

    e.preventDefault();

    // window.addEventListener('touchstart', touchEvent, { passive: false });

}

function isCorrect( xpos, ypos )
{
    file = false;
    rank = false;

    currFile = currTask[0];
    currRank = currTask[1];

    if (currFile == '') 
    {
        file = true;

    } else {

        fileBounds = rankFileBounds.get(currFile);

        file = (xpos > fileBounds[0] && xpos < fileBounds[1]);
    }

    if (currRank == '') 
    {
        rank = true;

    } else {

        rankBounds = rankFileBounds.get(currRank);

        rank = (ypos > rankBounds[0] && ypos < rankBounds[1]);
    }

    return (rank && file);
}

function highlightSquare( xpos, ypos ) 
{
    xIndex = Math.floor((xpos - boardBounds[0][0])/squareWidth);
    yIndex = Math.floor((ypos - boardBounds[1][0])/squareWidth);

    bctx.fillStyle = 'rgb(11, 76, 128)';

    boxy = boardBounds[0][0] + squareWidth * xIndex
    boxx = boardBounds[1][0] + squareWidth * yIndex

    bctx.globalAlpha = 0.5;
    bctx.fillRect(boxy, boxx, squareWidth + 1, squareWidth + 1);
    bctx.globalAlpha = 1.0;

    ctx.drawImage(bctx.canvas, 0, 0);
}

function nextTask( fileOnly, rankOnly ) 
{

    if (!rankOnly) 
    {
        do 
        {
            newFile = files[Math.floor(Math.random() * files.length)];

        } while (newFile == currTask[0])

        currTask[0] = newFile;

    } else {

        currTask[0] = '';
    }
    
    if (!fileOnly)
    {
        do 
        {
            newRank = ranks[Math.floor(Math.random() * ranks.length)];

        } while (newRank == currTask[1])

        currTask[1] = newRank;

    } else {

        currTask[1] = '';
    }

    setVisualTask();

}

function setVisualTask()
{
    document.getElementById("currTask").innerHTML = currTask[0] + currTask[1];
}

function setScore( newScore )
{
    document.getElementById("score").innerHTML = newScore;
}

init();

