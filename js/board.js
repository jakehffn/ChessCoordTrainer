var ctx;
var bctx;

var files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
var ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
var rankFileBounds = new Map();

var currTask = ['a', ''];
var boardBounds = [[0, 0],[0,0]];
var squareWidth = 0;

var settings = [false, false];
var isGameLoop = false;
var interval;

var cSelect = 'rgb(75, 105, 205)'; // Selection highlight color
var cDark = 'rgb(25, 92, 63)'; // Dark Green
var cLight = 'rgb(212, 190, 152)'; // Beige
var cError = 'rgb(234, 105, 98)'; // Red
var cBackground = 'rgb(41, 40, 40)'; // Grey
var cLighOverlay = 'white'; 
var cDarkOverLay = 'black';

const timer = document.getElementById('timer');
const counter = document.getElementById('counter');
const taskBox = document.getElementById('currTask');

numCorrect = 0;

function init() 
{
    window.addEventListener('resize', load);

    window.addEventListener('mousedown', clickEvent);
    window.addEventListener('mouseup', initBoard);

    window.addEventListener('touchstart', touchEvent, { passive: false });
    window.addEventListener('touchend', initBoard);

    // reset the height whenever the window's resized
    window.addEventListener("resize", resetHeight);
    // called to initially set the height.
    resetHeight();

    load();
    


};  

function resetHeight(){
    // reset the body height to that of the inner browser
    document.body.style.height = window.innerHeight + "px";
}


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

    bctx.fillStyle = cBackground;
    bctx.fillRect(0, 0, width, height);

    ctx.fillStyle = cBackground;
    ctx.fillRect(0, 0, width, height);

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
};

function initBoard()
{
    bctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    bctx.fillStyle = cBackground;
    bctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    margin = window.innerHeight/10;
    squareWidth = (Math.min(window.innerWidth, window.innerHeight - 2*margin))/8;

    leftOffset = (window.innerWidth > window.innerHeight - 2*margin) ? (window.innerWidth - window.innerHeight + 2*margin)/2 : 0;
    topOffset = (window.innerWidth > window.innerHeight - 2*margin) ? margin : (window.innerHeight - window.innerWidth)/2;

    boardBounds = [[leftOffset, leftOffset + 8*squareWidth], [topOffset, topOffset + 8*squareWidth]];

    for (var xx = 0; xx < 8; xx++) 
    {
        for (var yy = 0; yy < 8; yy++)
        {
            bctx.fillStyle = ((xx + yy) % 2 == 1) ? cDark : cLight;

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
}

function load() 
{
    initCanvas();
    initBoard();
}

async function clickEvent( e )
{

    window.removeEventListener('mousedown', clickEvent);

    if (!isGameLoop) {

        taskBox.style.fontSize = 'min(calc(50vh), 60vw)';
        taskBox.style.top = 'calc(50vh - calc(1.1*min(calc(50vh), 60vw)))'
        numCorrect = 0;
        gameLoop();
        nextTask(settings[0], settings[1]);
        setVisualTask();

    } else {

        xpos = e.clientX;
        ypos = e.clientY;

        selectedSquare = toSquareCoords(xpos, ypos);

        // Condition: click is within the bounds of the board
        if (selectedSquare != -1)
        {

            if (isCorrect(selectedSquare)) 
            {
                highlightSquare(selectedSquare, cSelect);

                numCorrect += 1;

                nextTask(settings[0], settings[1]);

            } else {

                window.removeEventListener('mouseup', initBoard);
                window.removeEventListener('touchend', initBoard);

                highlightSquare(selectedSquare, cError);
                highlightSquare(currTask, cSelect);

                taskBox.style.color = cError;
                await new Promise(r => setTimeout(r, 1000));
                // reset task text color
                taskBox.style.color = cLighOverlay;
                nextTask(settings[0], settings[1]);

                initBoard();

                window.addEventListener('mouseup', initBoard);
                window.addEventListener('touchend', initBoard);
            }
            

        } else {


        }

    }

    

    window.addEventListener('mousedown', clickEvent);
    window.addEventListener('touchstart', touchEvent, { passive: false });
}

async function touchEvent( e )
{
    window.removeEventListener('touchstart', touchEvent, { passive: false });
    
    // Get coordinates from touch object
    let newE = {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY};
    clickEvent(newE);

    e.preventDefault();

    // window.addEventListener('touchstart', touchEvent, { passive: false });

}

async function gameLoop() {

    isGameLoop = true;

    interval = setInterval("gameUpdates()", 100);
}

async function gameUpdates() {

    newTime = parseFloat(timer.innerText) - .1;
    timer.innerText = newTime.toFixed(1);

    counter.innerText = numCorrect;

    if (timer.innerText <= 0.0) {

        timer.innerText = 30.0;

        clearInterval(interval);
        isGameLoop = false;

        taskBox.style.top = 'calc(50vh - calc(.6*min(calc(50vh), 60vw)))'
        taskBox.style.fontSize = 'min(calc(26vh), 36vw)';
        taskBox.innerText = 'End';

        // dont allow restart for some time
        window.removeEventListener('touchstart', touchEvent, { passive: false });
        window.removeEventListener('mousedown', clickEvent);

        await new Promise(r => setTimeout(r, 2000));

        window.addEventListener('mousedown', clickEvent);
        window.addEventListener('touchstart', touchEvent, { passive: false });
        taskBox.innerText = 'Start!';
    }
}

function isCorrect( squareCoord )
{
    return ((squareCoord[0] == currTask[0] || currTask[0] == '') && 
        (squareCoord[1] == currTask[1] || currTask[1] == ''));
}

function highlightSquare( squareCoord, highlightColor) 
{
    xIndex = files.indexOf(squareCoord[0]);
    yIndex = ranks.indexOf(squareCoord[1]);

    bctx.fillStyle = highlightColor;

    boxy = boardBounds[0][0] + squareWidth * xIndex
    boxx = boardBounds[1][0] + squareWidth * yIndex

    bctx.globalAlpha = 0.5;
    bctx.fillRect(boxy, boxx, squareWidth, squareWidth);
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

// Convert x/y coordinates to board coordinates
function toSquareCoords(xpos, ypos) {

    // Condition: click is within the bounds of the board
    if (xpos > boardBounds[0][0] && xpos < boardBounds[0][1] && ypos > boardBounds[1][0] && ypos < boardBounds[1][1] )
    {

        xIndex = Math.floor((xpos - boardBounds[0][0])/squareWidth);
        yIndex = Math.floor((ypos - boardBounds[1][0])/squareWidth);

        return [files[xIndex], ranks[yIndex]];

    } else {

        return -1;
    }
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

