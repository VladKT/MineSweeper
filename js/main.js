'use strict'

const MINE = "💣";
const BOOM = "💥";
const FLAG = "🚩";
const COVER = "⬜";
var gLevel = { SIZE: 8, MINES: 12 }; // the difficulty of the game

var gBoard;  // contains the main board of the game

var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 } // state of the game
var gMinesPos; // keeps the positions of all the bombs on the board
var gInterval;

document.querySelector('h1').innerText = 'Minesweeper work in progress';
// gBoard = buildBoard();
// setMinesNegsCount();
// renderBoard(gBoard);
// console.log(gBoard);
// console.log(gMinesPos);



// initiates the game. This is called when page loads
function initGame() {
    gBoard = buildBoard();
    setMinesNegsCount();
    renderBoard(gBoard);
    gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 };
    document.querySelector('.marked span').innerText = gLevel.MINES;
}


// Builds the board  Set mines at random locationsCallsetMinesNegsCount()Return the created board
function buildBoard() {
    var board = [];
    var minesPosArr = [];
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
    while (minesPosArr.length < gLevel.MINES) {
        var minePosI = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var minePosJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
        if (!board[minePosI][minePosJ].isMine) {
            board[minePosI][minePosJ].isMine = true;
            minesPosArr.push({ i: minePosI, j: minePosJ });
        }
        // for (var i = 0; i < minesPosArr; i++) {
        //     if (minesPosArr[i].i === minePosI && minesPosArr[i].j == minePosJ) {
        //         minePosI = getRandomIntInclusive(0, gLevel.SIZE - 1);
        //         minePosJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
        //     }
        // }
        // minesPosArr.push({ i: minePosI, j: minePosJ })
        // board[minePosI][minePosJ].isMine = true;
    }
    gMinesPos = (minesPosArr);
    return board;
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

// Renderthe board as a <table>to the page
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

    // console.log('strHTML is:');
    // console.log(strHTML);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (gGame.secsPassed === 0) gInterval = setInterval(runTimer, 1000);
    if (gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isMine) {
        gGame.isOn = false;
    }    
    if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) expandShown(i, j);
    gBoard[i][j].isShown = true;
    gGame.shownCount ++;
    renderCell(i, j); 
}

// Called on right clickto mark a cell (suspected to bea mine)
//Search the web (and implement)how to hide the context menu onright click
function cellMarked(elCell, i, j) {
    gBoard[i][j].isMarked = true;
    renderCell(i, j);
    gGame.markedCount ++;
    document.querySelector('.marked span').innerText = gLevel.MINES - gGame.markedCount;
}

//Gameends when all mines are marked and all the other cells are shown
function checkGameOver() {
if (gGame.shownCount + gGame.markedCount === gLevel.SIZE)
console.log('Victory');
}


// When user clicks acell withnomines around, we need to open not only that cell, but also its neighbors. 
//NOTE: start with a basic implementation that only opens the non-mine 1stdegree neighbors
function expandShown(m, k) {
    for (var i = m - 1; i <= m + 1; i++) {
        for (var j = k - 1; j <= k + 1; j++) {
            if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1) continue;
            if (!gBoard[i][j].isMarked) {
                gBoard[i][j].isShown = true;
                gGame.shownCount ++;
                renderCell(i, j);
                // if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) expandShown(i, j); // recursion attempt
            }
        }
    }
}



// window.oncontextmenu = function () {
//     alert('Right Click')
// }

// el.addEventListener('contextmenu', function(ev) {
//     ev.preventDefault();
//     alert('Right Click Performed!');
//     return false;
// }, false);

function runTimer() {
    document.querySelector('.timer span').innerText = gGame.secsPassed;
    gGame.secsPassed += 1;
}

// aid func for renred. Returns the class name for a specific cell 
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}


function countNeig(m, k) {
    var count = 0;
    for (var i = m - 1; i <= m + 1; i++) {
        for (var j = k - 1; j <= k + 1; j++) {
            if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1) continue;
            if (gBoard[i][j].isMine) count++;
        }
    }
    return (gBoard[m][k].isMine) ? count - 1 : count;
    // return count;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}


function renderCell(i, j) {
    var cellSelector = '.' + getClassName({ i: i, j: j })
    // console.log(cellSelector); // test
    var elCell = document.querySelector(cellSelector);
    // console.log(elCell); // test
    if (gBoard[i][j].isMarked) {
        elCell.innerHTML = FLAG;
    } else if (gBoard[i][j].isMine && !gGame.isOn) {
        elCell.innerHTML = BOOM;
    }else if  (gBoard[i][j].isMine && gGame.isOn) {
        elCell.innerHTML = MINE;
    } else elCell.innerHTML = gBoard[i][j].minesAroundCount;
}

// // Returns the class name for a specific cell
// function getClassName(i,j) {
// 	var cellClass = 'cell-' + i + '-' + j;
// 	return cellClass;
// }