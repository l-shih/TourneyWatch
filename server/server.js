'use strict';

require('dotenv').config();

const port = process.env.PORT || 8080;
const env = process.env.ENV || 'development';
const express = require('express');
const bodyParser = require('body-parser');
const sass = require('node-sass-middleware');
const app = express();
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig[env]);
const morgan = require('morgan');
const knexLogger = require('knex-logger');
const cookieSession = require('cookie-session');
const owjs = require('overwatch-js');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const generateName = require('sillyname');

// // Seperated Routes for each Resource
const usersRoutes = require('./routes/users');
const tournamentEnrollmentsRoutes = require('./routes/tournament_enrollments');
const tournamentsRoutes = require('./routes/tournaments');
// const gamesRoutes = require('./routes/games');
// const teamsRoutes = require('./routes/teams');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000
}));

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Mount all resource routes
app.use('/users', usersRoutes(knex, bcrypt));
app.use('/tournament_enrollments', tournamentEnrollmentsRoutes(knex, owjs));
app.use('/tournaments', tournamentsRoutes(knex, _, env, generateName));
// app.use('/games', gamesRoutes(knex));
// app.use('/teams', teamsRoutes(knex));


// Home page, passes along whis logged in as the 'login' variable
app.get('/', (req, res) => {
  
  res.render('index', {email: req.session.email});
});

app.get('/json', (req, res) => {
  res.json(['Joel', 'Mel']);
})

app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
  console.log('Example app listening on port ' + port);
});
