let game = {
    ongoing: false, // boolean that tells if the game is running 
    player1: undefined, // player 1 socket
    player2: undefined, // player 2 socket
    player1Ready: false, // boolean that tells if player 1 is connected to the game
    player2Ready: false, // boolean that tells if player 2 is connected to the game
    initPlayer: undefined, // the player that starts the game by deciding the initial number (can be 1 or 2)
    num: undefined, // the current number in the game
    turn: undefined, // player that is next to make a move (can be 1 or 2)
}

const startGame = () => {
    console.log('Starting game...');

    game.ongoing = true;

    game.initPlayer = Math.floor(Math.random() * 2) + 1;
    const initPlayerSocket = game.initPlayer === 1 ? game.player1 : game.player2;

    initPlayerSocket.emit('init', { initPlayer: game.initPlayer });

    game.turn = game.initPlayer === 1 ? 2 : 1;
};

const endGame = () => {
    game.ongoing = false;
    game.num = undefined;
    game.turn = undefined;
};

/**
 * This function gets as a parameter the player number that should initialize the game 
 * and returns a function that handles socket communication for that particular player
 *  
 * */
const generateInitGameLogic = (player) => {
    return (initMessage) => {
        if (game.initPlayer === player) {
            game.turn = game.initPlayer === 1 ? 2 : 1;
            game.num = initMessage.initValue;

            let nextPlayer = game.turn === 1 ? game.player1 : game.player2;

            game.player1.emit('comment', { message: `Player ${game.initPlayer} initialized the game with the number ${game.num}` })
            game.player2.emit('comment', { message: `Player ${game.initPlayer} initialized the game with the number ${game.num}` })

            nextPlayer.emit('status', { turn: game.turn, num: game.num });
        }
    }
}


/**
 * This function gets as a parameter the player number and returns a function that handles socket communication regarding the moves for that particular player
 *  */
const generatePlayerGameLogic = (player) => {
    return (move) => {
        if (game.ongoing && game.turn === player) {
            const currentPlayer = player === 1 ? game.player1 : game.player2;
            if (verifyMove(move)) {
                game.turn = player === 1 ? 2 : 1;
                let nextPlayer = game.turn === 1 ? game.player1 : game.player2;

                game.num += move.value;

                /**
                 * From the requirements of the game it is unclear what happens if the player (adjusted manually by the user) chooses 
                 * to add a number which results in a number not divisible by 3.
                 * I decided to make the integer division to keep the game going in this case
                */
                game.num = Math.floor(game.num / 3);

                nextPlayer.emit('comment', { message: `Player ${player} played ${move.value}.` });

                if (game.num === 1) {
                    console.log(`Player ${player} is the winner`);
                    game.player1.emit('comment', { message: `Player ${player} is the winner` });
                    game.player2.emit('comment', { message: `Player ${player} is the winner` });
                    endGame();
                }
                else if (game.num === 0) {
                    game.player1.emit('comment', { message: `Current number is 0. Game ends without a winner.` });
                    game.player2.emit('comment', { message: `Current number is 0. Game ends without a winner.` });
                    endGame();                }
                else {
                    nextPlayer.emit('status', { turn: game.turn, num: game.num });
                }
            }
            else {
                currentPlayer.emit('comment', { message: `Invalid move. Choose a value among '-1', '0', '1'.` });
                currentPlayer.emit('status', { turn: game.turn, num: game.num });
            }
        }
    };
};

const connectionHandler = (socket) => {
    if (game.player1 === undefined) {
        game.player1 = socket;

        socket.on('disconnect', (reason) => {
            console.log('Player 1 disconnected');
            game.player1 = undefined;
            game.player1Ready = false;
            endGame();
        });

        socket.on('ready', (msg) => {
            game.player1Ready = true;
            if (game.player1 && game.player2 && game.player1Ready && game.player2Ready) {
                startGame();
            }
        });
        socket.on('init', generateInitGameLogic(1));
        socket.on('move', generatePlayerGameLogic(1));

        console.log('Player 1 connected');

        socket.emit('id', { id: 1 });
    }
    else if (game.player2 === undefined) {
        game.player2 = socket;
        socket.on('disconnect', (reason) => {
            console.log('Player 2 disconnected');
            game.player2 = undefined;
            game.player2Ready = false;
            endGame();
        });

        socket.on('ready', (msg) => {
            game.player2Ready = true;
            if (game.player1 && game.player2 && game.player1Ready && game.player2Ready) {
                startGame();
            }
        });
        socket.on('init', generateInitGameLogic(2));
        socket.on('move', generatePlayerGameLogic(2));

        console.log('Player 2 connected');
        socket.emit('id', { id: 2 });
    }
    else {
        return;
    }
};

const verifyMove = (move) => {
    return move.value === 0 || move.value === 1 || move.value === -1;
}

module.exports = connectionHandler;