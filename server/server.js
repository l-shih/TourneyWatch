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


// // Seperated Routes for each Resource
const usersRoutes = require('./routes/users');
// const tournamentEnrollmentsRoutes = require('./routes/tournament_enrollments');
// const tournamentsRoutes = require('./routes/tournaments');
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
app.use('/styles', sass({
  src: __dirname + '/styles',
  dest: __dirname + '/public/styles',
  debug: true,
  outputStyle: 'expanded'
}));

app.use(express.static('public'));

// Mount all resource routes
app.use('/users', usersRoutes(knex, cookieSession));
// app.use('/tournament_enrollments', tournamentEnrollmentsRoutes(knex));
// app.use('/tournaments', tournamentsRoutes(knex));
// app.use('/games', gamesRoutes(knex));
// app.use('/teams', teamsRoutes(knex));


// Home page, passes along whis logged in as the 'login' variable
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(port, () => {
  console.log('Example app listening on port ' + port);
});
