"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex, owjs) => {
  // overwatch api insists on all lowercase
  const offenseHeroes = ['doomfist', 'genji', 'mccree', 'pharah', 'soldier:_76', 'sombra', 'tracer'];
  const defenseHeroes = ['bastion', 'hanzo', 'junkrat', 'mei', 'torbjörn', 'widowmaker'];
  const tankHeroes = ['d.va', 'orisa', 'reinhardt', 'roadhog', 'winston', 'zarya'];
  const supportHeroes = ['ana', 'lúcio', 'mercy', 'moira', 'symmetra', 'zanyatta'];

  /**
   * Provides a sorted array of each player's most played hero (by time)
   * from most to least
   * @param {array} data result of overwatch api
   * @param {array} heroNames const variables of hero names by role type
   * @returns {array}
   */
  function roleTimePlayed(data, heroNames) {
    return Object.keys(data.quickplay.heroes).reduce((sum, key) => {
      const arrayOfTimes = [];
      for (const i in heroNames) {
        if (data.quickplay.heroes[`${heroNames[i]}`]) {
          arrayOfTimes.push(data.quickplay.heroes[`${heroNames[i]}`].time_played);
        }
      }
      return arrayOfTimes.reduce((a, b) => a + b);
    }, 0);
  }

  /**
   * Provides a sorted array of each player's most played (by time) role class
   * from most to least
   * @param {array} data result of overwatch api
   * @returns {array}
   */
  function sortTimePlayed(data) {
    const playerTimeStats = [
      {role: 'offense', time: roleTimePlayed(data, offenseHeroes)},
      {role: 'defense', time: roleTimePlayed(data, defenseHeroes)},
      {role: 'tank', time: roleTimePlayed(data, tankHeroes)},
      {role: 'support', time: roleTimePlayed(data, supportHeroes)}
    ];
    return playerTimeStats.sort((a, b) => {
      return b.time - a.time;
    });
  }

  /**
   * Total time played as a character with the key 'healing_done'
   *
   * @param {array} data result of overwatch api
   * @returns {integer}
   */
  function totalTimeHealing(data) {
    return Object.keys(data.quickplay.heroes).reduce((sum, key) => {
      if (data.quickplay.heroes[key].healing_done) {
        return sum + data.quickplay.heroes[key].time_played;
      }
      return sum;
    }, 0);
  }

  function healsPerSecond(data) {
    return data.quickplay.global.healing_done / totalTimeHealing * 100;
  }

  function dmgPerSecond(data) {
    return data.quickplay.global.all_damage_done / (data.quickplay.global.time_played - totalTimeHealing);
  }

  function playersEnrolled(tournamentID){
    return knex
      .select("users.battlenet_id", "level", "games_won", "medal_gold", "medal_silver", "medal_bronze")
      .from("tournament_enrollments")
      .innerJoin("users", "users.id", "tournament_enrollments.user_id")
      .where({tournament_id: tournamentID})
      .then((result) => {
        return result
      });
  }

  router.get("/:id/enroll", (req, res) => {
    const tournamentID = req.params.id;
    const currUserID = req.session.userID;

    if (!currUserID) {
      // figure out better way to handle if not logged in 
      res.redirect("/users/login");
    }
    
    knex
      .select("battlenet_id", "email")
      .from("users")
      .where({id: currUserID})
      .then((currUser) => {
        const currBattlenetID = currUser[0].battlenet_id;
        const currEmail = currUser[0].email;
        knex
          .select("users.battlenet_id", "tournaments.id", "is_started", "creator_user_id", "no_of_teams", "name", "description")
          .from("tournaments")
          .innerJoin("users", "users.id", "tournaments.creator_user_id")
          .where({"tournaments.id": tournamentID})
          .then( async (results) => {
            const enrolledPlayers = await playersEnrolled(tournamentID);

            const started = results[0].is_started;
            const teamCount = results[0].no_of_teams;
            const creatorUserID = results[0].creator_user_id;
            const tournamentName = results[0].name;
            const tournamentDescr = results[0].description;
            const isReady = (enrolledPlayers.length === teamCount * 6);
            
            res.render("tournament_enroll", {
              email: currEmail,
              teamCount: teamCount,
              tournamentID: tournamentID,
              tournamentName: tournamentName,
              tournamentDescr: tournamentDescr,
              tournamentCreator: currBattlenetID,
              isReady: isReady
            })
          })
      })
  })

  // Adds a new line in to enrollments for each new player
  // given that their battlenet ID exists
  router.post("/:id/enroll/", (req, res) => {
    const currUserID = req.session.userID;
    knex
      .select("id", "battlenet_id")
      .from("users")
      .where({id: currUserID})
      .then((results) => {
        if(results.length === 0){
          // STRETCH: Show 'Invalid Battlenet ID' error page
          res.sendStatus(404);
        } else{
          res.send(owjs.getAll('pc', 'us', results[0].battlenet_id)
            .then((data) => {
              const roleRanks = sortTimePlayed(data);
              return knex('tournament_enrollments').insert({
                'user_id': results[0].id,
                'team_id': null,
                'tournament_id': req.params.id,
                'level': data.profile.level,
                'first_role': roleRanks[0].role,
                'first_role_time_played': roleRanks[0].time,
                'second_role': roleRanks[1].role,
                'second_role_time_played': roleRanks[1].time,
                'medal_gold': data.quickplay.global.medals_gold,
                'medal_silver': data.quickplay.global.medals_silver,
                'medal_bronze': data.quickplay.global.medals_bronze,
                'games_won': data.quickplay.global.games_won
              });
            })
          );
        }
      });
  });

  //page for enrolling in a currently existing tournament
  router.get("/:id/enroll", (req, res) => {
    knex
    .select("name", "description", "no_of_teams")
    .from("tournaments")
    .where({id: req.params.id})
    .then((results) => {
      const name = results[0].name;
      const description = results[0].description;
      const teamCount = results[0].no_of_teams;
      req.session.tournamentID = req.params.id;
      // res.sendStatus(200);
      res.render('tournament_enroll', {email: req.session.email, name: name, description: description, teamCount: teamCount, tournamentID: req.params.id})
    });
    
  });

  return router;
};

