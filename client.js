const io = require('socket.io-client');

const socket = io('http://localhost:8000');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let isAutonomousClient = false; // boolean that tells if the client is autonomous or adjustable by the user

socket.on('id', (msg) => {
    console.log(`You are player ${msg.id}\n`)
    if (msg.id === 2) {
        // Player 2 can be autonomous or manual
        rl.question('Would you like to play autonomously? (y/n)', (answer) => {
            if (answer.toLowerCase() === 'y') {
                isAutonomousClient = true;
                socket.emit('ready', { message: true });
            }
            else {
                isAutonomousClient = false;
                socket.emit('ready', { message: true });
            }
        });
    }
    else {
        // Player 1 is always autonomous
        isAutonomousClient = true;
        socket.emit('ready', { message: true });
    }
});

socket.on('init', (msg) => {
    if (isAutonomousClient) {
        const initValue = Math.floor(Math.random() * (10000 - 3 + 1)) + 3; // initial value can be a random integer in the range 3...10000.
        socket.emit('init', { initValue: initValue });
    }
    else {
        rl.question('Initialize the game with a number:', (answer) => {
            socket.emit('init', { initValue: Number.parseInt(answer) });
        });
    }
});

socket.on('status', (msg) => {
    console.log(`It is your turn to play. Current number: ${msg.num}`);

    let value;

    if (isAutonomousClient) {
        if (msg.num % 3 === 0) {
            value = 0;
        }
        else if (msg.num % 3 === 1) {
            value = -1;
        }
        else {
            value = 1;
        }
        console.log(`Sending the move ${value}`);
        socket.emit('move', { value: value });
        console.log('\n');
    }
    else {
        rl.question('Your move: ', (answer) => {
            socket.emit('move', { value: Number.parseInt(answer) });
        });
    }
});

socket.on('comment', (msg) => {
    console.log(`Commentator: ${msg.message}\n`);
});