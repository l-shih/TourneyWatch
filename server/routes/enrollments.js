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

  function playersEnrolled(tournamentID){
    return knex
      .select("users.battlenet_id", "level", "games_won", "medal_gold", "medal_silver", "medal_bronze")
      .from("enrollments")
      .innerJoin("users", "users.id", "enrollments.user_id")
      .where({tournament_id: tournamentID})
      .then((result) => {
        return result
      });
  }


    /**
   * Updates the team
   * @param  {int} userID    userID of user
   * @param  {int} newTeamID [description]
   */
  function swapTeams(bnetID1, bnetID2,res){
    //TODO, REFACTOR THIS SHIT!
    if(bnetID1 === bnetID2){
      res.sendStatus(400);
      return
    }

    knex
     .select("users.id",'users.battlenet_id', "team_id")
     .from("enrollments")
     .innerJoin("users", "users.id", "enrollments.user_id")
     .where({battlenet_id: bnetID1})
     .orWhere({battlenet_id: bnetID2})
     .then((results) => {
      const team1 = results[0].team_id;
      const team2 = results[1].team_id;
      const player1ID = results[0].id;
      const player2ID = results[1].id;
      console.log('attempting to swap!');
      console.log(team1 + ' ' + player1ID + ' ' + results[0].battlenet_id);
      console.log(team2 + ' ' + player2ID + ' ' + results[1].battlenet_id);
      knex("enrollments")
        .where({"user_id": player1ID})
        .update({"team_id": team2})
        .then(() => {
          console.log('swapped!');
        });
      knex("enrollments")
        .where({"user_id": player2ID})
        .update({"team_id": team1})
        .then(() => {
          console.log('swapped!');
        });

     });
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

  function getPlayersInfo(battlenetID, tournamentID, userID) {
    return owjs.getAll('pc', 'us', battlenetID)
      .then((data) => {
        console.log('heey')
        const roleRanks = sortTimePlayed(data);
        knex
          .insert({
            'user_id': userID,
            'team_id': null,
            'tournament_id': tournamentID,
            'avatar': data.profile.avatar,
            'level': data.profile.level,
            'role_summary': JSON.stringify(roleRanks);
            'first_role': roleRanks[0].role,
            'first_role_time_played': roleRanks[0].time,
            'second_role': roleRanks[1].role,
            'second_role_time_played': roleRanks[1].time,
            'medal_gold': data.quickplay.global.medals_gold,
            'medal_silver': data.quickplay.global.medals_silver,
            'medal_bronze': data.quickplay.global.medals_bronze,
            'games_won': data.quickplay.global.games_won
          })
          .into("enrollments")
          .then(() => {
            console.log('done using owjs')
          });
    });
  }



  router.get("/:id/enroll", (req, res) => {
    const tournamentID = req.params.id;
    const currUserID = req.session.userID;

    if (!currUserID) {
      // Figure out a better way to handle this.
      // Maybe status 400, with link to register or sign in
      res.redirect('/users/new');
    } else {
      knex
      .select("battlenet_id", "email")
      .from("users")
      .where({id: currUserID})
      .then((currUser) => {
        const currBattlenetID = currUser[0].battlenet_id;
        const currEmail = currUser[0].email;
        knex
          .select("id")
          .from("enrollments")
          .where({id: currUserID})
          .then((results) => {
            if (results.length > 0 ) {
              // STRETCH: "You've already enrolled to this tournament"
              res.sendStatus(400)
            } else {
              knex
              .select("users.battlenet_id", "tournaments.id", "is_started", "creator_user_id", "no_of_teams", "name", "description")
              .from("tournaments")
              .innerJoin("users", "users.id", "tournaments.creator_user_id")
              .where({"tournaments.id": tournamentID})
              .then( async (results) => {

                const enrolledPlayers = await playersEnrolled(tournamentID);
                const started = results[0].is_started;
                const teamCount = results[0].no_of_teams;
                const tournamentCreator = results[0].battlenet_id;
                const tournamentName = results[0].name;
                const tournamentDescr = results[0].description;
                const isReady = (enrolledPlayers.length === teamCount * 6);

                if (currBattlenetID === tournamentCreator) {
                  // STRETCH: "You cannot play in a tournament you've made"
                  res.sendStatus(400);
                } else {
                  res.render("tournament_enroll", {
                    email: currEmail,
                    teamCount: teamCount,
                    tournamentID: tournamentID,
                    tournamentName: tournamentName,
                    tournamentDescr: tournamentDescr,
                    tournamentCreator: tournamentCreator,
                    enrolledPlayers: enrolledPlayers,
                    isReady: isReady
                  });
                }
              })
            }
          })
      })
    }
  })


  // Adds a new line in to enrollments for each new player
  // given that their battlenet ID exists
  router.get("/:id/enrollmentinfo.json", (req, res) => {
    knex
      .select("tournaments.name", "users.battlenet_id", "team_id", "level", "games_won", "medal_gold", "medal_silver", "medal_bronze", "first_role", "users.id")
      .from("enrollments")
      .innerJoin("users", "users.id", "enrollments.user_id")
      .innerJoin("tournaments", "tournaments.id", "enrollments.tournament_id")
      .where({'users.battlenet_id': req.query.bnetID})
      .then((playerStats) => {
        // console.log(playerStats[0]);
        res.send(playerStats[0]);
      });

  });

  router.post("/:id/swap", (req, res) => {
    console.log(req.body);
    const tournamentID = req.params.id
    const bnetID1 = req.body.bnetID1;
    const bnetID2 = req.body.bnetID2;
    //TO DO, make sure the user is the owner
    knex
      .select("id")
      .from("tournaments")
      .where({id: tournamentID})
      .then(async(results) => {

        // console.log('Tournament ID, ' + results[0].id);
        if(results.length === 0) {
          // STRETCH: Show 'No tournament of that name found' error page
          res.sendStatus(404);
        } else {
          await swapTeams(bnetID1, bnetID2,res);

        }
      });
    console.log('i should redirect...');
    res.sendStatus(200);
  });



  // Adds a new line in to enrollments for each new player
  // given that their battlenet ID exists
  router.post("/1/enroll/", (req, res) => {
    const currUserID = req.session.userID;
    const tournamentID = req.params.id;
    knex
      .select("id", "battlenet_id")
      .from("users")
      .then( async (results) => {
          for (let u = 0; u < results.length; u++ ){
            try {
              throw await getPlayersInfo(results[u].battlenet_id, 1, results[u].id);
            }
            catch(e) {
              console.log(e);
            }
            
          }
          res.sendStatus(200);
      });
  });



  return router;
};

