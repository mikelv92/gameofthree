const express = require('express');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('*', (req, res) => {
    res.status(200).json({ message: 'Game of Three' })
});

module.exports = app;