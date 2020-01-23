'use strict'

const MINE = "💣";
const BOOM = "💥";
const FLAG = "🚩";
const COVER = "⬜";
const WIN = "😎";
const LOST = "😵";
const SMILE = "🙂";
var gLevel = { SIZE: 4, MINES: 2 }; // the difficulty of the game
var isHintClicked = false; // changes the state of cellClicked to reveal hint
var gBoard;  // contains the main board of the game
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, hintsUsed: 0 } // state of the game
var gMinesPos; // keeps the positions of all the bombs on the board
var gInterval;


// initiates the game. This is called when page loads
function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    clearInterval(gInterval);
    gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, hintsUsed: 0 };
    document.querySelector('.marked span').innerText = gLevel.MINES;
    document.querySelector('.timer span').innerText = gGame.secsPassed;
    document.querySelector('.reset').innerText = SMILE;
    document.querySelector('h2 span').innerText = localStorage.getItem(gLevel.SIZE);
    var hintDivs = document.querySelectorAll('.hints');
    for (var i = 0; i < hintDivs.length; i++) {
        hintDivs[i].style.backgroundColor = '';
    }
}


// Builds the board  Set mines at random locationsCallsetMinesNegsCount()Return the created board
function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board;
}

// randomly destributing the mines on the board (except on given pos)
function seedMines(i, j) {
    var minesPosArr = [];
    while (minesPosArr.length < gLevel.MINES) {
        var minePosI = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var minePosJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
        if ((!gBoard[minePosI][minePosJ].isMine) && (minePosI !== i && minePosJ !== j)) {
            gBoard[minePosI][minePosJ].isMine = true;
            minesPosArr.push({ i: minePosI, j: minePosJ });
        }
    }
    gMinesPos = (minesPosArr);
}

// Count mines around each cell and set the cell's minesAroundCount
function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine) {
                gBoard[i][j].minesAroundCount = countNeig(i, j);
            }
        }
    }
}

// Renderthe board as a <table> to the page
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j })
            strHTML += '\t<td class="cell ' + cellClass +
                '"  onclick="cellClicked(this,' + i + ',' + j + ')" oncontextmenu="cellMarked(this,' + i + ',' + j + ')" >\n';
            if (!currCell.isShown) {
                strHTML += COVER;
            }
            else if (currCell.isMine) {
                strHTML += MINE;
            }
            else if (currCell.minesAroundCount > 0) {
                strHTML += currCell.minesAroundCount;
            }
            else if (currCell.isMarked) {
                strHTML += FLAG;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


// Called when a cell <td> is clicked. one of the main functions.
function cellClicked(elCell, i, j) {
    if (gGame.secsPassed === 0 && !gGame.isOn) {   // prevents the chance to hit mine on 1st click
        gInterval = setInterval(runTimer, 1000);
        seedMines(i, j);
        setMinesNegsCount();
        renderBoard(gBoard);
        gGame.isOn = true;
    }
    if (isHintClicked) { // sets show hint mode instead of click
        showHint(i, j);
        isHintClicked = false;
        return;
    }
    if (gBoard[i][j].isMarked) return; // prevents clicking on flagged cells

    if (gBoard[i][j].isMine) {
        gGame.isOn = false;
    }
    if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) { // runs if a cell with 0 neig is clicked
        expandShown(i, j);
    } else if (gBoard[i][j].isShown === false) { // this if prevents from clicking on an open cell multiple times
        gBoard[i][j].isShown = true;
        gGame.shownCount++;
        renderCell(i, j);
    }
    checkGameOver();
}

// Called on right clickto mark a cell (suspected to be a mine)
function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        elCell.innerHTML = COVER;
    } else {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        renderCell(i, j);
    }
    document.querySelector('.marked span').innerText = gLevel.MINES - gGame.markedCount;
    checkGameOver();
}

// Game ends when all mines are marked and all the other cells are shown, or mine is hit
function checkGameOver() {
    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
        document.querySelector('.reset').innerText = WIN;
        console.log('Victory');
        clearInterval(gInterval);
        SetHighScore();
    } else if (!gGame.isOn) {
        document.querySelector('.reset').innerText = LOST;
        console.log('You blew yourself up!');
        revealMines();
        clearInterval(gInterval);
    }
}

// exposes all the mines (used on hitting a mine)
function revealMines() {
    while (gMinesPos.length > 0) {
        var pos = gMinesPos.pop();
        gBoard[pos.i][pos.j].isShown = true;
        gBoard[pos.i][pos.j].isMarked = false;
        renderCell(pos.i, pos.j);
    }
}

// this function handles the high score on local storage
function SetHighScore() {
    var currHighScore = localStorage.getItem(gLevel.SIZE);
    if (currHighScore > gGame.secsPassed || localStorage.getItem(gLevel.SIZE) === null) {
        localStorage.setItem(gLevel.SIZE, gGame.secsPassed);
        document.querySelector('h2 span').innerText = localStorage.getItem(gLevel.SIZE);
    }
}


// When user clicks a cell withnomines around, we need to open not only that cell, but also its neighbors.
// recursive
function expandShown(m, k) {
    for (var i = m - 1; i <= m + 1; i++) {
        for (var j = k - 1; j <= k + 1; j++) {
            if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1) continue;
            if (!gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true;
                gGame.shownCount++;
                renderCell(i, j);
                if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine && (i !== m && j !== k)) {
                    expandShown(i, j);
                }
            }
        }
    }
}

// shows a hint around a click cell for 1 second
function showHint(m, k) {
    for (var i = m - 1; i <= m + 1; i++) {
        for (var j = k - 1; j <= k + 1; j++) {
            if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1) continue;
            renderHint(i, j);
        }
    }
    setTimeout(function () {
        for (var i = m - 1; i <= m + 1; i++) {
            for (var j = k - 1; j <= k + 1; j++) {
                if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1) continue;
                renderCell(i, j);

            }
        }
    }, 1000);
}

//enables the next click on the board to be with a hint logic
function enableHint(elHintBut) {
    if (gGame.hintsUsed < 3) {
        isHintClicked = true;
        gGame.hintsUsed++;
        console.dir(gGame.hintsUsed);
        elHintBut.style.backgroundColor = 'brown';
    }
}


// Seconds passed since the first click
function runTimer() {
    document.querySelector('.timer span').innerText = gGame.secsPassed;
    gGame.secsPassed += 1;
}



// updates a cell in DOM
function renderCell(i, j) {
    var cellSelector = '.' + getClassName({ i: i, j: j })
    var elCell = document.querySelector(cellSelector);
    if (gBoard[i][j].isMarked) {
        elCell.innerHTML = FLAG;
    } else if (gBoard[i][j].isShown === false) {
        elCell.innerHTML = COVER;
    } else if (gBoard[i][j].isMine && !gGame.isOn) {
        elCell.innerHTML = BOOM;
    } else if (gBoard[i][j].isMine && gGame.isOn) {
        elCell.innerHTML = MINE;
    } else elCell.innerHTML = (gBoard[i][j].minesAroundCount > 0) ? gBoard[i][j].minesAroundCount : '';
}


// this function does a special render for the hint function
function renderHint(i, j) {
    var cellSelector = '.' + getClassName({ i: i, j: j })
    var elCell = document.querySelector(cellSelector);
    if (gBoard[i][j].isMine) {
        elCell.innerHTML = MINE;
    } else elCell.innerHTML = (gBoard[i][j].minesAroundCount > 0) ? gBoard[i][j].minesAroundCount : '';
}

// changes the difficulty of the game
function changeDiff(elBut) {
    var diff = elBut.className;
    switch (diff) {
        case 'beginner':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            initGame();
            break;
            case 'medium':
                gLevel.SIZE = 8;
                gLevel.MINES = 12;
                initGame();
                break;
                case 'expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            initGame();
            break;
        }
}

// aid func for rended. Returns the class name for a specific cell 
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

// aid function for setMinesNegsCount
function countNeig(m, k) {
    var count = 0;
    for (var i = m - 1; i <= m + 1; i++) {
        for (var j = k - 1; j <= k + 1; j++) {
            if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1) continue;
            if (gBoard[i][j].isMine) count++;
        }
    }
    return (gBoard[m][k].isMine) ? count - 1 : count;
}


// aid function - random between 2 numbers
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}