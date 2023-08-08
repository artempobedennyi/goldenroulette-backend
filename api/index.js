var express = require('express');
const app = express();

const userRoute = require('./user');
const publicRoute = require('./public');

app.use('/auth', userRoute)
app.use('/public', publicRoute)

module.exports = app;
