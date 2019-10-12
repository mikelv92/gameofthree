const io = require('socket.io-client');

const socket = io('http://localhost:8000');

socket.on('id', (msg) => {
    console.log(msg.id);
    if (msg.id === 1) {
        console.log('I am player 1');
    }
    else if (msg.id === 2) {
        console.log('I am player 2');
    }
});

socket.on('init', (msg) => {
    socket.emit('init', { initValue: 57 });
    console.log(msg);
});

socket.on('status', (msg) => {
    console.log(msg);
})