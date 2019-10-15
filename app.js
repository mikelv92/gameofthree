const express = require('express');
const logger = require('morgan');

const http = require('http');
const sockethandler = require('./sockethandler');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('*', (req, res) => {
    res.status(200).json({ message: 'Game of Three' })
});

const port = parseInt(process.env.PORT, 10) || 8000;
app.set('port', 8000);

const server = http.createServer(app);
const io = require('socket.io')(server);
io.on('connection', sockethandler);
server.listen(port);