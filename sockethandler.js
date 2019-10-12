let game = {
    ongoing: false,
    player1: undefined,
    player2: undefined,
    num: undefined,
    turn: undefined
}

const startGame = () => {
    // game.turn = Math.floor(Math.random() * 2) + 1;
    game.initPlayer = Math.floor(Math.random() * 2) + 1;
    const initPlayerSocket = game.initPlayer === 1 ? game.player1 : game.player2;
    initPlayerSocket.emit('init', { initPlayer: game.initPlayer });
};

const endGame = () => {
    game.ongoing = false;
    game.num = undefined;
    game.turn = undefined;
    console.log('Game ended');
};

const generateInitGameLogic = (player) => {
    return (initMessage) => {
        console.log(initMessage);
        if (game.initPlayer === player) {
            if (initMessage.initValue > 3) {
                game.turn = game.initPlayer === 1 ? 2 : 1;
                game.num = initMessage.initValue;
                game.player1.emit('status', { turn: game.turn, num: game.num });
                game.player2.emit('status', { turn: game.turn, num: game.num });
            }
        }
    }
}

const generatePlayerGameLogic = (player) => {
    return (move) => {
        if (game.ongoing && game.turn === player) {
            if (verifyMove(move)) {
                game.turn = player === 1 ? 2 : 1;
                game.num += move.value;
                game.num /= 3;
                game.player1.emit('status', { turn: game.turn, num: game.num });
                game.player2.emit('status', { turn: game.turn, num: game.num });
            }
        }
    };
};

const connectionHandler = (socket) => {
    if (game.player1 === undefined) {
        game.player1 = socket;

        socket.on('disconnect', (reason) => {
            game.player1 = undefined;
            endGame();
        });

        socket.on('init', generateInitGameLogic(1));
        socket.on('move', generatePlayerGameLogic(1));

        console.log('Player 1 connected');

        socket.emit('id', { id: 1 });
    }
    else if (game.player2 === undefined) {
        game.player2 = socket;
        socket.on('disconnect', (reason) => {
            game.player2 = undefined;
            endGame();
        });

        socket.on('init', generateInitGameLogic(2));
        socket.on('move', generatePlayerGameLogic(2));

        console.log('Player 2 connected');
        socket.emit('id', { id: 2 });
    }
    else {
        return;
    }

    if (game.player1 && game.player2) {
        startGame();
    }
};

const verifyMove = (move) => {
    return move.value === 0 || move.value === 1 || move.value === -1;
}

module.exports = connectionHandler;