let game = {
    ongoing: false,
    player1: undefined,
    player2: undefined,
    num: undefined,
    turn: undefined,
    player1Ready: false,
    player2Ready: false
}

const startGame = () => {
    console.log('Starting game...');
    game.initPlayer = Math.floor(Math.random() * 2) + 1;
    const initPlayerSocket = game.initPlayer === 1 ? game.player1 : game.player2;
    initPlayerSocket.emit('init', { initPlayer: game.initPlayer });
    game.ongoing = true;
    game.turn = game.initPlayer === 1 ? 2 : 1;
};

const endGame = () => {
    game.ongoing = false;
    game.num = undefined;
    game.turn = undefined;
};

const generateInitGameLogic = (player) => {
    return (initMessage) => {
        if (game.initPlayer === player) {
            if (initMessage.initValue > 3) {
                game.turn = game.initPlayer === 1 ? 2 : 1;
                game.num = initMessage.initValue;

                let nextPlayer = game.turn === 1 ? game.player1 : game.player2;

                game.player1.emit('comment', { message: `Player ${game.initPlayer} initialized the game with the number ${game.num}` })
                game.player2.emit('comment', { message: `Player ${game.initPlayer} initialized the game with the number ${game.num}` })

                nextPlayer.emit('status', { turn: game.turn, num: game.num });
            }
        }
    }
}

const generatePlayerGameLogic = (player) => {
    return (move) => {
        if (game.ongoing && game.turn === player) {
            if (verifyMove(move)) {
                game.turn = player === 1 ? 2 : 1;
                let nextPlayer = game.turn === 1 ? game.player1 : game.player2;

                game.num += move.value;
                game.num /= 3;

                nextPlayer.emit('comment', { message: `Player ${player} played ${move.value}.` });

                if (game.num === 1) {
                    console.log(`Player ${player} is the winner`);
                    game.player1.emit('comment', { message: `Player ${player} is the winner` });
                    game.player2.emit('comment', { message: `Player ${player} is the winner` });
                    endGame();
                }
                else {
                    nextPlayer.emit('status', { turn: game.turn, num: game.num });
                }
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