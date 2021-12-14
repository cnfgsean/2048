// Initialize the canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var windowHeight;
var gameGrid;

var loseMessage;
var winMessage;

const gridSize = 4;

function resizeWindow() {
    // Scale the canvas respective to the shortest edge

    if (window.innerHeight < window.innerWidth) {
        scaledEdge = window.innerHeight;
    } else {
        scaledEdge = window.innerWidth;
    }

    canvas.width = canvas.height = scaledEdge * 0.8;

    var borderSize = canvas.height * 0.015;
    var borderString = `${borderSize}px solid #444`;

    canvas.style.border = borderString;

    gameGrid.updateResize();
}


// Event listener for window resizing
window.onresize = resizeWindow;

// Event listener for keyboard input
window.addEventListener("keydown", handleKeypress);
window.addEventListener("keyup", handleKeyup);

var keysDown = new Set([]);

function handleKeypress(event) {
    var key = event.key;
    if ((key == "ArrowLeft" || key == "ArrowRight" || 
    key == "ArrowUp" || key == "ArrowDown") && 
    !keysDown.has(key)) {
        keysDown.add(key);
        gameGrid.move(key);
    }
    
}

function handleKeyup(event) {
    var key = event.key;
    if ((key == "ArrowLeft" || key == "ArrowRight" || 
    key == "ArrowUp" || key == "ArrowDown") && 
    keysDown.has(key)) {
        keysDown.delete(key);
    }
    
}


function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

function Grid() {
    // Create a 2-D list of cells 
    this.cells = []
    for (let i = 0; i < gridSize; i++) {
        this.cells.push([]);
    }

    // Initialize each cell in the grid
    this.cells.forEach(function (element) {
        for (let i = 0; i < gridSize; i++) {
            element.push(0)

        }
    });
    console.log(this.cells);

    // Called whenever the window is resized
    this.updateResize = function () {
        // Create new units
        this.unitX = canvas.width / this.cells.length;
        this.unitY = canvas.height / this.cells.length;
        // console.log(this.unitX);
        // console.log(this.unitY);
    }


    // Update function called every frame
    this.update = function () {
        this.drawCells();
    }

    // Draw each cell on the canvas
    this.drawCells = function () {
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                var cellPadding = this.unitX * 0.03;
                var upperLeftX = this.unitX * j + cellPadding;
                var upperLeftY = this.unitY * i + cellPadding;
                var value = this.cells[i][j];
                ctx.fillStyle = this.decideFillStyle(value);

                // Draw the cell background
                ctx.fillRect(upperLeftX, upperLeftY,
                    this.unitX - (2 * cellPadding), this.unitY - (2 * cellPadding));

                // Draw the number
                if (value != 0) {
                    ctx.fillStyle = "#ddd";
                    var fontSize = this.unitX * 0.35;
                    ctx.font = `${fontSize}px Arial`;
                    ctx.textAlign = "center";
                    ctx.fillText(value.toString(), upperLeftX + this.unitX * 0.48,
                        upperLeftY + this.unitY * 0.6);
                }

            }
        }
    }


    // Returns a string for the fillstyle to account for
    // different cells having different colors
    this.decideFillStyle = function (value) {
        switch (value) {
            case 0:
                return "#ddd";
            case 2:
                return "#bbb";
            case 4:
                return "#909590";
            case 8:
                return "#808a80";
            case 16:
                return "#707f70";
            case 32:
                return "#405040";
            case 64:
                return "#304030";
            case 128:
                return "#203520";
            case 256:
                return "#103510";
            case 512:
                return "#104010";
            case 1024:
                return "#102010";
            case 2048:
                return "#000";
            default:
                return "#ccc";
        }
    };

    // Fill a cell, given its position and value
    this.fillCell = function (x, y, value) {
        this.cells[x][y] = value;
    }

    // Returns a list of all empty cells
    this.findEmptyCells = function () {
        var emptyCells = [];
        for (var i = 0; i < this.cells.length; i++) {
            for (var j = 0; j < this.cells[i].length; j++) {
                if (this.cells[i][j] == 0) {
                    emptyCells.push([i, j]);
                }
            }
        }

        return emptyCells;
    }

    // Generate a random value in an empty space
    this.generateCell = function () {
        // find empty cells
        var emptyCells = this.findEmptyCells();
        // choose a random empty cell
        if (emptyCells.length > 0) {
            var randomCell = choose(emptyCells);
            var x = randomCell[0];
            var y = randomCell[1];
            // select random value
            var value = choose([2, 2, 2, 4]);
            this.fillCell(x, y, value);
        }
        

    }

    this.move = function(key) {
        switch (key) {
            case "ArrowLeft":
                this.moveLeft();
                break;
            case "ArrowRight":
                this.moveRight();
                break;
            case "ArrowUp":
                this.moveUp();
                break;
            case "ArrowDown":
                this.moveDown();
                break;
            default:
                break;
        }
        this.generateCell();
    }

    this.moveLeft = function () {
        console.log("left");
        for (var i = 0; i < this.cells.length; i++) {
            for (var j = 0; j < this.cells.length - 1; j++) {
                for (var k = j + 1; k < this.cells.length; k++) {
                    if (this.cells[i][k] != 0) {
                        // found a cell that is non-zero
                        if ((this.cells[i][k] == 0) || (this.cells[i][j] == 0)) {
                            // check if we can merge
                            console.log("merged ", i, j, i, k);
                            this.cells[i][j] += this.cells[i][k];
                            this.cells[i][k] = 0;
                        } else {
                            if (this.cells[i][j] == this.cells[i][k]) {
                                this.cells[i][j] += this.cells[i][k];
                                this.cells[i][k] = 0;
                            }
                            break;
                        }

                    }

                }
            }

        }
    }

    this.moveRight = function () {
        console.log("right");
        for (var i = 0; i < this.cells.length; i++) {
            for (var j = this.cells.length - 1; j > -1; j--) {
                for (var k = j - 1; k > -1; k--) {
                    if (this.cells[i][k] != 0) {
                        // found a cell that is non-zero
                        if ((this.cells[i][k] == 0) || (this.cells[i][j] == 0)) {
                            // check if we can merge
                            console.log("merged ", i, j, i, k);
                            this.cells[i][j] += this.cells[i][k];
                            this.cells[i][k] = 0;
                        } else {
                            if (this.cells[i][j] == this.cells[i][k]) {
                                this.cells[i][j] += this.cells[i][k];
                                this.cells[i][k] = 0;
                            }
                            break;
                        }

                    }
                }
            }

        }
    }

    this.moveUp = function () {
        console.log("up");
        for (var i = 0; i < this.cells.length; i++) {
            for (var j = 0; j < this.cells.length - 1; j++) {
                for (var k = j + 1; k < this.cells.length; k++) {
                    if (this.cells[k][i] != 0) {
                        // found a cell that is non-zero
                        if ((this.cells[k][i] == 0) || (this.cells[j][i] == 0)) {
                            // check if we can merge
                            this.cells[j][i] += this.cells[k][i];
                            this.cells[k][i] = 0;
                        } else {
                            if (this.cells[j][i] == this.cells[k][i]) {
                                this.cells[j][i] += this.cells[k][i];
                                this.cells[k][i] = 0;
                            }
                            break;
                        }

                    }
                }
            }

        }
    }

    this.moveDown = function () {
        console.log("down");
        for (var i = 0; i < this.cells.length; i++) {
            for (var j = this.cells.length - 1; j > -1; j--) {
                for (var k = j - 1; k > -1; k--) {
                    if (this.cells[k][i] != 0) {
                        // found a cell that is non-zero
                        if ((this.cells[k][i] == 0) || (this.cells[j][i] == 0)) {
                            // check if we can merge
                            this.cells[j][i] += this.cells[k][i];
                            this.cells[k][i] = 0;
                        } else {
                            if (this.cells[j][i] == this.cells[k][i]) {
                                this.cells[j][i] += this.cells[k][i];
                                this.cells[k][i] = 0;
                            }
                            break;
                        }

                    }
                }

            }

        }
    }

    this.checkMovesLeft = function() {
        // Check if there are any empty cells
        var emptyCells = this.findEmptyCells();
        if (emptyCells.length > 0) {
            return true;
        }


        for (var i = 0; i < this.cells.length; i++) {
            for (var j = 0; j < this.cells[i].length; j++) {
                // Check if available moves to the right
                if (j < this.cells[i].length - 1) {
                    if (this.cells[i][j] == this.cells[i][j + 1]) {
                        return true;
                    }
                }
                // Check if available moves to the bottom
                if (i < this.cells.length - 1) {
                    if (this.cells[i][j] == this.cells[i + 1][j]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    this.displayGameLoss = function() {
        ctx.fillStyle = "rgba(30, 30, 30, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var fontSize = this.unitX * 0.9;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#ddd";

        ctx.fillText(loseMessage[0], this.unitX * 2, this.unitY * 1.7);
        ctx.fillText(loseMessage[1], this.unitX * 2, this.unitY * 2.7);
    }

    this.displayGameWin = function() {
        ctx.fillStyle = "rgba(90, 110, 90, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var fontSize = this.unitX * 0.9;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#ddd";

        ctx.fillText(winMessage[0], this.unitX * 2, this.unitY * 1.7);
        ctx.fillText(winMessage[1], this.unitX * 2, this.unitY * 2.7);
    }



    this.checkGameWin = function() {
        for (var i = 0; i < this.cells.length; i++) {
            if (this.cells[i].includes(2048)) {
                return true;
            }
        }
        
        return false;
    }
}


function chooseGameOverMessages() {
    var gameLoseMessages = [
        ["GAME", "OVER"],
        ["NICE", "TRY"],
        ["BETTER", "LUCK"]
    ];

    var gameWinMessages = [
        ["WELL", "PLAYED"],
        ["GOOD", "JOB"],
        ["TOO", "EASY"]
    ];

    loseMessage = choose(gameLoseMessages);
    winMessage = choose(gameWinMessages);
}

// Function to run the game loop
function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameGrid.update();
    if (gameGrid.checkGameWin()) {
        gameGrid.displayGameWin();
    } else if (!gameGrid.checkMovesLeft()) {
        gameGrid.displayGameLoss();
    }
    window.requestAnimationFrame(run);
}


// Init function to setup the game and run the game loop
function init() {
    chooseGameOverMessages();
    gameGrid = new Grid();
    resizeWindow();
    gameGrid.generateCell();
    gameGrid.generateCell();
    gameGrid.generateCell();

    run();
}



init();