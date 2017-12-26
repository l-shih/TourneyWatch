"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex, _, env, generateName) => {

  /**
   * This assigns each player to a team based off their skill level
   *
   * @param {array} playersArray
   * @param {array} teamArray
   * @returns {array}
   */
  function assignPlayersToTeams(playersArray, teamArray) {
    const teamAssignments = [];
    const playerCount = playersArray.length;
    const teamCount = teamArray.length;
    const maxPlayerOffset = playerCount - (playerCount % teamCount);
    let ascending = true;
    for (let p = 0; p < maxPlayerOffset; p += teamCount) {
      if(ascending) {
        for (let t = 0; t < teamCount; t++) {
          teamAssignments.push({ 'id': playersArray[p + t].id, 'team_id': (t + 1) });
        }
      } else {
        for (let t = teamCount - 1; t >= 0; t--) {
          teamAssignments.push({'id': playersArray[p - (t - (teamCount - 1))].id, 'team_id': (t + 1)});
        }
      }
      ascending = !ascending;
    }
    return teamAssignments;
  }

  /**
   * Counts how many support type players
   *
   * @param {array} data result of overwatch api
   * @param {string} roleChoiceNo can either 'first_role' or 'second_role'
   * @returns
   */
  function countSupport(data, roleChoice) {
    let count = 0;
    data.forEach((key) => {
      if (key[roleChoice] === 'support') {
        return count ++;
      }
      // TO DO: possible refactor?
      (key[roleChoice] === "support") ? count++ : 0;

    });
    return count;
  }

  /**
   * This updates database to show team assignments
   *
   * @param {array} teamAssigned
   */
  function assignToTeams(teamAssigned) {
    teamAssigned.forEach((p) => {
      return knex("tournament_enrollments")
        .where({"id": p.id})
        .update({"team_id": p.team_id})
        .then(() => {});
    });
  }

  /**
   * Intializes the brackets json object based on the no of teams and updates the tournaments table
   * @param  {array} teamArray    Array of team ID objects
   * @param  {int} teamCount  No of teams in the tournament
   * @param  {int} tournamentID Tournament ID
   */
  function initializeBrackets(teamArray, teamCount, tournamentID){
    let data = {"teams": [], "results":[]};
    for (let b = 0; b < teamArray.length; b+=2 ) {
      data.teams.push(
        [{ name: teamArray[b].id    , flag: "in" },
         { name: teamArray[b + 1].id, flag: "in" },]
      );
      data.results.push(
        [0,0], [0, 0]
      );
    }
    return knex("tournaments")
      .where({"id": tournamentID})
      .update({"brackets": JSON.stringify(data), is_started: true})
      .then(() => {});
  }

  /**
   * Gets each team's roster
   *
   * @param {integer} tournamentID from req params
   * @returns {array}
   */
  function getTeamRoster(tournamentID){
    return knex
     .select("tournaments.name", "users.battlenet_id", "team_id", "level", "games_won", "medal_gold", "medal_silver", "medal_bronze")
     .from("tournament_enrollments")
     .innerJoin("users", "users.id", "tournament_enrollments.user_id")
     .innerJoin("tournaments", "tournaments.id", "tournament_enrollments.tournament_id")
     .where({tournament_id: tournamentID})
     .orderBy("team_id", "ascd")
     .then((playerStats) => {
       return _.groupBy(playerStats, "team_id");
     });
  }

  /**
   * Gets a list of all players enrolled in an tournament
   *
   * @param {integer} tournamentID from req params
   * @returns {array}
   */
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

  // Goes to new tournaments page
  router.get('/new', (req, res) => {
    if (!req.session.email) {
      // STRETCH: "Forbidden" error page
      res.sendStatus(403);
    }
    res.render('tournament_new',{email: req.session.email});
  });

  // Creates new tournament
  router.post("/new", (req, res) => {
    // GET PARAMS CORRECTLY
    const name = req.body.name;
    const teamCount = req.body.no_of_teams;
    const description = req.body.description;
    if(!name){
      // STRETCH: Show 'That name has been taken' error page
      res.sendStatus(400);
      return;
    }
    knex
      .select("name")
      .from("tournaments")
      .where({name: name})
      .then((results) => {
        // If the tournament name does not exist, create new line in tournaments
        // and creates new lines in teams (based on # of teams needed)
        if(results.length === 0) {
          knex
            .insert({name: name, no_of_teams: teamCount, description: description, creator_user_id: req.session.userID, is_started: false})
            .into('tournaments')
            .returning('id')
            .then((tournamentID)=> {
              for (let i = 0; i < teamCount; i++) {
                knex("teams")
                  .insert({"tournament_id": tournamentID[0], "name": `${generateName()}s`})
                  .then(() => {});
              }
              res.redirect(`/tournaments/${tournamentID[0]}`)
            });
        } else {
          // STRETCH: Show 'Tournament name taken' error page
          res.sendStatus(400);
        }
      });
  });

  // Tournament bracket and teams page
  router.get('/brackets.json', (req, res) => {
    const tournamentID = req.query.tournamentID;
    knex
      .select("brackets")
      .from("tournaments")
      .where({id: tournamentID})
      .then((results) => {
        console.log('am in brackets.json', results);
        res.json(results[0]);
      });
  });

  router.get("/cards.json", (req, res) => {
    const tournamentID = req.query.tournamentID;
    // if(req.session.email !== process.env.ADMIN_EMAIL) {
    //   // STRETCH: "Forbidden" error page
    //   res.sendStatus(403);
    // }
    // Gets player stats for each team in a specific tournament
    knex
      .select("tournaments.name", "users.battlenet_id", "team_id", "level", "games_won", "medal_gold", "medal_silver", "medal_bronze")
      .from("tournament_enrollments")
      .innerJoin("users", "users.id", "tournament_enrollments.user_id")
      .innerJoin("tournaments", "tournaments.id", "tournament_enrollments.tournament_id")
      .where({tournament_id: tournamentID})
      .orderBy("team_id", "ascd")
      .then((playerStats) => {
        const teamRoster = _.groupBy(playerStats, "team_id");
        res.send(teamRoster);
      });
  });

  // Tournament bracket and teams page
  router.get('/brackets.json', (req, res) => {
    const tournamentID = req.query.tournamentID;
    console.log('in bracekt.json, am tournid', tournamentID);
    // if(req.session.email !== process.env.ADMIN_EMAIL) {
    //   // STRETCH: "Forbidden" error page
    //   res.sendStatus(403);
    // }
    knex
      .select("brackets")
      .from("tournaments")
      .where({id: tournamentID})
      .then((results) => {
        console.log('i am in brackets.json', results[0]);
        res.json(results[0]);
      });
  });

  // Updates bracket data in the DB
  router.post("/update", (req, res) => {
    console.log('Updating DB brackets');
    console.log(req.body.tournamentID + req.body.bracketData);
    knex("tournaments")
        .where({"id": req.body.tournamentID})
        .update({"brackets": req.body.bracketData})
        .then(() => {console.log('Bracket data updated')});
  });

  router.get("/:id/admin", (req, res) => {
    const tournamentID = parseInt(req.params.id);
    
    // if(!Number.isInteger(tournamentID)) {
    //   console.log('not a vaid id')
    //   return res.sendStatus(404);
    // }

    knex
      .select("id", "is_started", "creator_user_id", "no_of_teams", "name")
      .from("tournaments")
      .where({id: tournamentID})
      .then(async (results) => {
        const isOwner = (req.session.userID === results[0].creator_user_id);
        if(isOwner) {
          const enrolledPlayers = await playersEnrolled(tournamentID);
          const isOwner = true;
          const teamCount = results[0].no_of_teams;
          const started = results[0].is_started;
          const isReady = (enrolledPlayers.length === teamCount * 6);

          if (isReady && started) {
            initializeBrackets(teamArray, results[0].no_of_teams, tournamentID);
            res.render("tournament_view", {
              teamRoster: getTeamRoster(tournamentID),
              playerCount: enrolledPlayers.length,
              tournamentDescr: results[0].description,
              tournamentName: results[0].name,
              tournamentID: tournamentID,
              email: req.session.email,
              started: started,
              isOwner: isOwner});
          } else {
            res.render("tournament_staging", {
              playerCount: enrolledPlayers,
              teamCount: results[0].no_of_teams,
              tournamentDescr: results[0].description,
              tournamentName: results[0].name,
              tournamentID: tournamentID,
              email: req.session.email,
              isReady: isReady
            });
          }
        } else {
          res.redirect(`/tournaments/${tournamentID}`);
        }
      })
  });

  router.get("/:id", (req, res) => {
    const tournamentID = parseInt(req.params.id);
    // TODO: FIX, WILL NOT CONSOLE LOG, BUUUT DOES NOT ERROR OUT ANYMORE WHEN A STRING IS USED
    if (!Number.isInteger(tournamentID)) {
      console.log('not a valid id')
      return res.sendStatus(404);
    }

    return knex
      .select("id", "is_started", "creator_user_id", "no_of_teams", "name")
      .from("tournaments")
      .where({id: tournamentID})
      .then( async (results) => {
        const enrolledPlayers = await playersEnrolled(tournamentID);
        const teamCount = results[0].no_of_teams;
        const started = results[0].is_started;
        const creatorUserID = results[0].creator_user_id;
        const isReady = (enrolledPlayers.length === teamCount * 6);
        const isOwner = (req.session.userID === creatorUserID);

        if(isOwner) {
          res.redirect(`/tournaments/${tournamentID}/admin`);
        }
        
        if (isReady && started) {
          // initializeBrackets(teamArray, results[0].no_of_teams, tournamentID);
          res.render("tournament_view", {
            teamRoster: getTeamRoster(tournamentID),
            playerCount: enrolledPlayers.length,
            email: req.session.email,
            started: started,
            tournamentName: results[0].name,
            tournamentID: tournamentID,
            isOwner: isOwner
          })
        } else {
          res.render("tournament_notready", {
            tournamentName: results[0].name,
            playerCount: enrolledPlayers.length,
            teamCount: results[0].no_of_teams,
            email: req.session.email,
            tournamentID: tournamentID
          })
        }
      });
  });

  router.post("/:id/start", (req, res) => {
  const tournamentID = req.params.id
    // if(!tournamentID){
    //   // STRETCH: Show 'You did not enter a tournament name' error page
    //   res.sendStatus(400);
    //   return;
    // }
    console.log(tournamentID)
    // Lists players from highest level to lowest, then assigns a team ID #
    // to each player via an array
    knex
      .select("id", "name", "no_of_teams")
      .from("tournaments")
      .where({id: tournamentID})
      .then((results) => {

        // console.log('Tournament ID, ' + results[0].id);
        if(results.length === 0) {
          // STRETCH: Show 'No tournament of that name found' error page
          res.sendStatus(404);
        } else {
          knex
            .select("id", "level")
            .from("tournament_enrollments")
            .where({tournament_id: tournamentID})
            .orderBy("level", "desc")
            .then((playersArray) => {
              knex
                .select("id")
                .from("teams")
                .where({tournament_id: tournamentID})
                .then((teamArray) => {
                  initializeBrackets(teamArray, results[0].no_of_teams, tournamentID);
                  const teamAssigned = assignPlayersToTeams(playersArray, teamArray);
                  assignToTeams(teamAssigned);
                  res.redirect(`/tournaments/${tournamentID}/admin`);
                });
            });
        }
      });
  });
  return router;
};
