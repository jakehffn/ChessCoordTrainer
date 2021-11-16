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

    // window.addEventListener("touchstart", handleTouchStart, false);
    // window.addEventListener("touchmove", handleTouchMove, false);
    window.addEventListener('resize', load);

    window.addEventListener('mousedown', clickEvent);
    window.addEventListener('mouseup', initBoard);

    window.addEventListener('touchstart', touchEvent);
    window.addEventListener('touchend', initBoard);

    load();
    nextTask(settings[0], settings[1]);
    setVisualTask();
    
};

function getTouches(event) {
  return event.touches ||             // browser API
         event.originalEvent.touches; // jQuery
}                                                     

function initCanvas()
{
    const canvas = document.getElementById("canvas");
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    const bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = width;
    bufferCanvas.height = height;
    bctx = bufferCanvas.getContext('2d');
    bctx.fillStyle = 'rgb(41, 40, 40)';
    bctx.fillRect(0, 0, width, height);


    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(41, 40, 40)';
    ctx.fillRect(0, 0, width, height);
};

function initBoard()
{
    bctx.clearRect(0, 0, bctx.canvas.width, bctx.canvas.height);
    bctx.fillStyle = 'rgb(41, 40, 40)';
    bctx.fillRect(0, 0, bctx.canvas.width, bctx.canvas.height);

    // darkColor = 'rgb(41, 40, 40)'; // Grey
    // darkColor = 'rgb(211, 134, 155)'; // Purple
    darkColor = 'rgb(114, 41, 62)'; // Darker Purple
    // darkColor = 'rgb(169, 182, 101)'; // Green
    // darkColor = 'rgb(234, 105, 98)'; // Red
    lightColor = 'rgb(212, 190, 152)'; // Beige

    margin = 60;
    squareWidth = (Math.min(bctx.canvas.width, bctx.canvas.height - 2*margin))/8;

    leftOffset = (bctx.canvas.width > bctx.canvas.height - 2*margin) ? (bctx.canvas.width - bctx.canvas.height + 2*margin)/2 : 0;
    topOffset = (bctx.canvas.width > bctx.canvas.height - 2*margin) ? margin : (bctx.canvas.height - bctx.canvas.width)/2;

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

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(bctx.canvas, 0, 0);

    console.log('boardInit');
}

function load() 
{
    initCanvas();
    initBoard();
}

function clickEvent( e )
{
    xpos = e.clientX;
    ypos = e.clientY;

    if (xpos > boardBounds[0][0] && xpos < boardBounds[0][1] && ypos > boardBounds[1][0] && ypos < boardBounds[1][1] )
    {
        highlightSquare( xpos, ypos );

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

        correct = rank && file;

        if (correct) 
        {
            nextTask(settings[0], settings[1]);
            console.log(currTask[0] + currTask[1]);
        }

        console.log(correct);

    } else {

        console.log('not on board');

    }

}

function touchEvent( e )
{

    let newE = {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY};
    clickEvent(newE);
}

function highlightSquare( xpos, ypos ) 
{
    xIndex = Math.floor((xpos - boardBounds[0][0])/squareWidth);
    yIndex = Math.floor((ypos - boardBounds[1][0])/squareWidth);

    ctx.fillStyle = 'rgb(11, 76, 128)';

    boxy = boardBounds[0][0] + squareWidth * xIndex
    boxx = boardBounds[1][0] + squareWidth * yIndex

    ctx.globalAlpha = 0.5;
    ctx.fillRect(boxy, boxx, squareWidth + 1, squareWidth + 1);
    ctx.globalAlpha = 1.0;
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

