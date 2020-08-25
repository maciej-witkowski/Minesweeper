const board = document.getElementById("board");
const twod = board.getContext("2d");

function getMousePos(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

board.onmousedown = function(event) {
    whichButton(event);
};

function whichButton(e) {
    console.log(winPoint);
    var e = e || window.event;
    let btnCode;

    if ('object' === typeof e) {
        btnCode = e.button;

        switch (btnCode) {

            case 0:
                for(let i = 0; i < cols; i++) {
                    for(let j = 0; j < rows; j++) {
                        if (grid[i][j].inBoundaries(getMousePos(board, e).x, getMousePos(board, e).y)) {
                            if (grid[i][j].isHidden()) {
                                if (grid[i][j].isMinned() || winPoint == rows * cols - (minesAmount + 1)) {
                                    gameover();
                                } else {
                                    grid[i][j].reveal();
                                    grid[i][j].create();
                                }
                            }
                        }
                    }
                }
                break;

            case 1:
                for(let i = 0; i < cols; i++) {
                    for(let j = 0; j < rows; j++) {
                        if (grid[i][j].inBoundaries(getMousePos(board, e).x, getMousePos(board, e).y)) {
                            if (grid[i][j].isHidden()) {
                                if (!grid[i][j].isMarked()) {
                                    grid[i][j].mark();
                                    grid[i][j].handleMark();
                                } else {
                                    grid[i][j].mark();
                                    grid[i][j].handleMark();
                                }
                            }
                        }
                    }
                }
                break;
        }
    }
}

class Field {

    constructor(i, j, size) {
        this.i = i;
        this.j = j;
        this.size = size;
        this.x = this.i * this.size;
        this.y = this.j * this.size;
        this.hidden = true;
        this.minned = false;
        this.marked = false;
        this.neighbourAmount = 0;
    }

    create() {
        twod.fillStyle = "black";
        twod.beginPath();
        twod.rect(this.x, this.y, this.size, this.size);
        if (!this.isHidden()) {
            if (this.isMinned()) {
                twod.closePath();
                twod.stroke();
                twod.fillStyle = "black";
                twod.beginPath();
                twod.arc(this.x + this.size * 0.5, this.y + this.size * 0.5, this.size * 0.3, 0, 2 * Math.PI);
                twod.fillStyle = "red";
                twod.fill();
                twod.closePath();
                twod.stroke(); 
            } else {
                if (this.neighbourAmount > 0) {
                    twod.fillStyle = "gray"
                    twod.fill()
                    twod.font = "24px Arial";
                    twod.fillStyle = "black";
                    twod.fillText(this.neighbourAmount, this.x + 0.35 * this.size, this.y + 0.65 * this.size);  
                    twod.fillStyle = "black";
                } else {
                    twod.fillStyle = "lightgray"
                    twod.fill()
                }
                twod.closePath();
                twod.stroke();
            }
        } else {
            twod.closePath();
            twod.stroke(); 
        }
    }

    handleMark() {
        twod.fillStyle = "black";
        twod.beginPath();
        twod.rect(this.x, this.y, this.size, this.size);
        if (this.isHidden()) {
            if (this.isMarked()) {
                twod.closePath();
                twod.stroke();
                twod.fillStyle = "black";
                twod.beginPath();
                twod.arc(this.x + this.size * 0.5, this.y + this.size * 0.5, this.size * 0.3, 0, 2 * Math.PI);
                twod.fillStyle = "blue";
                twod.fill();
            } else {
                twod.closePath();
                twod.stroke();
                twod.clearRect(this.x, this.y, this.size, this.size);
            }
            twod.closePath();
            twod.stroke();
        } else {
            twod.closePath();
            twod.stroke(); 
        }
    }

    isMinned() {
        return this.minned;
    }

    isHidden() {
        return this.hidden;
    }

    isMarked() {
        return this.marked;
    }

    countNeighbours() {
        if (this.isMinned()) {return this.neighbourAmount = -1;}
        let result = 0;
        for(let x = -1; x <= 1; x++) {
            for(let y = -1; y <= 1; y++) {
                let i = this.i + x;
                let j = this.j + y;
                if (i > -1 && i < cols && j > -1 && j < rows) {
                    let neighbour = grid[i][j];
                    if (neighbour.isMinned()) {result += 1;}
                }
            }
        }
        this.neighbourAmount = result;
    }

    inBoundaries(x, y) {
        return (x > this.x && x < this.x + this.size && y > this.y && y < this.y + this.size)
    }

    reveal() {
        winPoint++;
        this.hidden = false;
        if (this.neighbourAmount === 0) {this.showEmptyNeighbours();}
    }

    mark() {
        this.marked = !this.marked;
    }

    showEmptyNeighbours() {
        for(let x = -1; x <= 1; x++) {
            for(let y = -1; y <= 1; y++) {
                let i = this.i + x;
                let j = this.j + y;
                if (i > -1 && i < cols && j > -1 && j < rows) {
                    let neighbour = grid[i][j];
                    if (!neighbour.isMinned() && neighbour.isHidden()) {
                        neighbour.reveal();
                        neighbour.create();
                    }
                }
            }
        }
    }

}

const cols = 15;
const rows = 15;
const size = 50;
const minesAmount = 20;
var grid;
var winPoint = 0;

function createGrid(c, r) {
    const result = new Array(c);
    for(let i = 0; i < c; i++) {
        result[i] = new Array(r);
    }
    return result;
}

function initFields(workplace) {
    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            workplace[i][j] = new Field(i, j, size);
        }
    }
}

function layMines(workplace) {
    for(let n = 0; n < minesAmount; n++) {
        let i = Math.floor((Math.random() * cols));
        let j = Math.floor((Math.random() * rows));
        if (!workplace[i][j].isMinned()) {
            workplace[i][j].minned = true;
        } else {
            n -= 1;
        }
    }
}

function prepareNums(workplace) {
    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            workplace[i][j].countNeighbours();
        }
    }
}

function fillFields(workplace) {
    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            workplace[i][j].create();
        }
    }
}

function gameover() {
    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            grid[i][j].reveal();
            grid[i][j].create();
        }
    }
    let end = performance.now();

    twod.font = "35px Arial";
    twod.fillStyle = "black";

    let time = (end - start) / 1000;
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time) - 60 * minutes;

    if (minutes < 10 && seconds >= 10) {twod.fillText(`0${minutes}:${seconds}`, 340, 800);}
    else if (seconds < 10 && minutes >= 10) {twod.fillText(`${minutes}:0${seconds}`, 340, 800);}
    else if (seconds < 10 && minutes < 10) {twod.fillText(`0${minutes}:0${seconds}`, 340, 800);}
}

function play() {
    
    grid = createGrid(cols, rows);

    initFields(grid);

    layMines(grid);

    prepareNums(grid);

    fillFields(grid);

}

var start = performance.now();

play();