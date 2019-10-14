const io = require('socket.io-client');

const socket = io('http://localhost:8000');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let isAutomaticClient = false;

socket.on('id', (msg) => {
    console.log(`You are player ${msg.id}\n`)
    if (msg.id === 2) {
        rl.question('Automatic? (y/n)', (answer) => {
            if (answer === 'y') {
                isAutomaticClient = true;
                socket.emit('ready', { message: true });
            }
            else {
                isAutomaticClient = false;
                socket.emit('ready', { message: true });
            }
        });
    }
    else {
        isAutomaticClient = true;
        socket.emit('ready', { message: true });
    }
});

socket.on('init', (msg) => {
    if (isAutomaticClient) {
        socket.emit('init', { initValue: 57 });
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

    if (isAutomaticClient) {
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