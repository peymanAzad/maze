/**
 * Created by peyman on 1/11/17.
 */
var game = {
    sizeX: 10,
    sizeY: 10,
    dencity: 20,
    maze: {
        top: 50,
        left: 150,
        width: 500,
        height: 500
    },

    init: function(){
        $('.gamelayer').hide();
        $('#gamestartscreen').show();

        game.canvas = $('#gamecanvas')[0];
        game.context = game.canvas.getContext('2d');

    },
    showSettingsScreen: function(){
        $('.gamelayer').hide();
        $('#settingscreen').show();
    },
    play: function () {
        game.setSizes();

        $('.gamelayer').hide();
        $('#gamescreen').show();

        game.createMazeArray();
        game.drawMaze();

        game.Algo.init();

        var interval = setInterval(function(){
            if(game.terminated){
                clearInterval(interval);
            }else game.nextMove();
        }, 200);

        window.addEventListener('keydown', game.keyPressed);
    },
    keyPressed: function (e) {
        if(e.keyCode === 39){
            if(!game.terminated) game.nextMove();
        }
    },
    setSizes: function () {
        var x = $("#xNumber").val();
        var y = $("#yNumber").val();
        var dencity = $("#dencity").val();

        if(x != "") game.sizeX = x;
        if(y != "") game.sizeY = y;
        if(dencity != "") game.dencity = dencity;
    },
    createMazeArray: function () {
        game.mazeArr = new Array(game.sizeY);
        for (var i = 0; i < game.sizeY; i++) game.mazeArr[i] = new Array(game.sizeX);
        for(var i = 0; i < game.sizeY; i++)
            for(var j = 0; j < game.sizeX; j++)
                game.mazeArr[i][j] = 0;
        game.generateBlocks();
    },
    generateBlocks: function () {
        var index = game.dencity / 100;
        var total = game.sizeX * game.sizeY;
        var blocks = Math.floor(index * total);

        for(var i = 0; i < blocks; i++){
            var duplicated = false;
            do{
                var randX = game.getRand(game.sizeY);
                var randY = game.getRand(game.sizeX);
                if(game.mazeArr[randX][randY] !== 1){
                    game.mazeArr[randX][randY] = 1;
                    duplicated = false;
                }
                else duplicated = true;
            }while(duplicated);
        }
        game.mazeArr[0][0] = 0; //start cell can not be block
    },
    getRand: function (x) {
        return Math.floor((Math.random() * x));
    },
    drawMaze: function(){
        var gridWidth = Math.floor(game.maze.width / game.sizeX);
        var gridHeigth = Math.floor(game.maze.height / game.sizeY);
        game.cellWidth = gridWidth;
        game.cellHeight = gridHeigth;

        var context = game.context;

        context.clearRect(0, 0, game.canvas.width, game.canvas.height); //cleaning canvas

        context.beginPath();
        context.rect(game.maze.left, game.maze.top, gridWidth * game.sizeX, gridHeigth * game.sizeY);
        context.stroke();

        for(var i = game.maze.left, m = 0;m < game.mazeArr[0].length; i += gridWidth, m++){
            context.save();
            for(var j = game.maze.top, n = 0;n < game.mazeArr.length; j += gridHeigth, n++){
                if(game.mazeArr[n][m] === 1){
                    context.beginPath();
                    context.rect(i, j, gridWidth, gridHeigth);
                    context.fillStyle = 'navy';
                    context.fill();
                }else{
                    context.beginPath();
                    context.rect(i, j, gridWidth, gridHeigth);
                    context.fillStyle = 'lightcyan';
                    context.fill();
                }
                context.stroke();
            }
            context.restore();
        }

    },
    Algo:{
        init: function () {
            game.Algo.mouse.moveAhead = game.Algo.mouse.moveDown;
            game.Algo.mouse.location.x = game.Algo.mouse.location.y = 0;

            // game.Algo.sol = new Array();
            // game.Algo.sol = game.mazeArr.slice(); //for copying array

            game.Algo.drawMouse();
        },
        drawMouse: function () {
            var context = game.context;
            context.save();
            context.beginPath();
            context.rect(game.maze.left, game.maze.top, game.cellWidth, game.cellHeight);
            context.fillStyle = "brown";
            context.fill();
            context.stroke();
            context.restore();
        },
        mouse:{
            location:{
                x:0,
                y:0
            },
            moveRight: function () {
                var loc = game.Algo.mouse.location;
                ++loc.y;
            },
            moveLeft: function () {
                var loc = game.Algo.mouse.location;
                --loc.y;
            },
            moveUp: function () {
                var loc = game.Algo.mouse.location;
                --loc.x;
            },
            moveDown: function () {
                var loc = game.Algo.mouse.location;
                ++loc.x;
            },
            turnLeft: function () {
                var mouse = game.Algo.mouse;
                if(mouse.moveAhead === mouse.moveDown) mouse.moveAhead = mouse.moveRight;
                else if(mouse.moveAhead === mouse.moveRight) mouse.moveAhead = mouse.moveUp;
                else if(mouse.moveAhead === mouse.moveLeft) mouse.moveAhead = mouse.moveDown;
                else if(mouse.moveAhead === mouse.moveUp) mouse.moveAhead = mouse.moveLeft;
            },
            turnRight: function () {
                var mouse = game.Algo.mouse;
                if(mouse.moveAhead === mouse.moveDown) mouse.moveAhead = mouse.moveLeft;
                else if(mouse.moveAhead === mouse.moveRight) mouse.moveAhead = mouse.moveDown;
                else if(mouse.moveAhead === mouse.moveLeft) mouse.moveAhead = mouse.moveUp;
                else if(mouse.moveAhead === mouse.moveUp) mouse.moveAhead = mouse.moveRight;
            },
            turnBack: function () {
                var mouse = game.Algo.mouse;
                if(mouse.moveAhead === mouse.moveDown) mouse.moveAhead = mouse.moveUp;
                else if(mouse.moveAhead === mouse.moveRight) mouse.moveAhead = mouse.moveLeft;
                else if(mouse.moveAhead === mouse.moveLeft) mouse.moveAhead = mouse.moveRight;
                else if(mouse.moveAhead === mouse.moveUp) mouse.moveAhead = mouse.moveDown;
            }
        },
        decide: function(){
            if(game.Algo.checkifWinOrLose()) return;
            var mouse = game.Algo.mouse;
            var current = {
                x: game.Algo.mouse.location.x,
                y: game.Algo.mouse.location.y
            };
            var currentState = game.Algo.mouse.moveAhead;
            mouse.turnRight();
            mouse.moveAhead();
            if(game.Algo.isSafe()){
                //game.Algo.sol[mouse.location.x][mouse.location.y] = 9;
                game.Algo.fillRec(current);
            }else{
                game.Algo.reset(current, currentState);
                mouse.moveAhead();
                if(game.Algo.isSafe()){
                    //game.Algo.sol[mouse.location.x][mouse.location.y] = 9;
                    game.Algo.fillRec(current);
                }else{
                    game.Algo.reset(current);
                    mouse.turnLeft();
                    mouse.moveAhead();
                    if(game.Algo.isSafe()){
                        //game.Algo.sol[mouse.location.x][mouse.location.y] = 9;
                        game.Algo.fillRec(current);
                    }else{
                        game.Algo.reset(current, currentState);
                        mouse.turnBack();
                        mouse.moveAhead();
                        if(game.Algo.isSafe()){
                            //game.Algo.sol[mouse.location.x][mouse.location.y] = 9;
                            game.Algo.fillRec(current);
                        }else{
                            game.terminate();
                        }
                    }
                }
            }

        },
        isSafe: function () {
            var loc = game.Algo.mouse.location;
            if(loc.x >= 0 && loc.y >= 0 && loc.x < game.sizeY && loc.y < game.sizeX && game.mazeArr[loc.x][loc.y] === 0) return true;
            else return false;
        },
        reset: function (current, state) {
            var loc = game.Algo.mouse.location;
            loc.x = current.x;
            loc.y = current.y;
            if (state != undefined) game.Algo.mouse.moveAhead = state;
        },
        checkifWinOrLose: function () {
            var loc = game.Algo.mouse.location;
            if(loc.x === 0 && loc.y === 0 && game.Algo.begined) {
                if(game.Algo.mouse.moveAhead == game.Algo.mouse.moveUp && game.mazeArr[0][1] === 0) return false; //only exception of this algorithm
                game.terminate();
                return true;
            }
            if(loc.x === game.sizeY -1 && loc.y === game.sizeX -1) {
                game.win();
                return true;
            }
            game.Algo.begined = true;
            return false;
        },
        fillRec: function(current){
            var loc = game.Algo.mouse.location;
            var context = game.context;
            context.save();

            context.beginPath();
            context.rect(game.maze.left + (current.y * game.cellWidth), game.maze.top + (current.x * game.cellHeight), game.cellWidth, game.cellHeight);
            //if(context.fillStyle === "#e0ffff") context.fillStyle = "lightcyan";
            context.fillStyle = "yellow";
            context.fill();
            context.stroke();
            context.restore();

            context.beginPath();
            context.rect(game.maze.left + (loc.y * game.cellWidth), game.maze.top + (loc.x * game.cellHeight), game.cellWidth, game.cellHeight);
            context.fillStyle = "brown";
            context.fill();
            context.stroke();
            context.restore();

        }
    },
    terminate: function () {
        game.terminated = true;
    },
    win: function () {
        game.terminated = true;
    },
    nextMove: function(){
        if(game.terminated) return;
        game.Algo.decide();
    },
    restart: function () {
        game.terminated = true;
        window.removeEventListener("keydown", game.keyPressed);
        setTimeout(function () {
            game.Algo.begined = game.terminated = false;
        }, 200);
        game.init();
    }
}

$(function(){
    game.init();

    $("#xNumber").val(game.sizeX);
    $("#yNumber").val(game.sizeY);
    $("#dencity").val(game.dencity);
});

