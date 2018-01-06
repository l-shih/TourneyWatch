"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex, _, env, mailGun, owjs) => {

  // overwatch api insists on all lowercase
  const offenseHeroes = ['doomfist', 'genji', 'mccree', 'pharah', 'soldier:_76', 'sombra', 'tracer'];
  const defenseHeroes = ['bastion', 'hanzo', 'junkrat', 'mei', 'torbjörn', 'widowmaker'];
  const tankHeroes = ['d.va', 'orisa', 'reinhardt', 'roadhog', 'winston', 'zarya'];
  const supportHeroes = ['ana', 'lúcio', 'mercy', 'moira', 'symmetra', 'zanyatta'];

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



  function setTournamentStarted(tournamentID){
    knex("tournaments")
        .where({"id": tournamentID})
        .update({"is_started": true})
        .then(() => {});
  }

  /**
   * Counts how many support type players
   *
   * @param {array} data result of overwatch api
   * @param {string} roleChoice can either 'first_role' or 'second_role'
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
   * Counts how many support type players
   *
   * @param {array} data result of overwatch api
   * @param {string} roleChoiceNo can either 'first_role' or 'second_role'
   * @returns
   */
  function countRole(data, role, firstOrSecondRole) {
    let count = 0;
    data.forEach((key) => {
      if (key[firstOrSecondRole] === role) {
        return count ++;
      }
      // TO DO: possible refactor?
      (key[firstOrSecondRole] === role) ? count++ : 0;
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
      return knex("enrollments")
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
     .select("tournaments.name", "users.battlenet_id", "team_id", "level", "games_won", "medal_gold", "medal_silver", "medal_bronze", "users.id", "first_role", "second_role")
     .from("enrollments")
     .innerJoin("users", "users.id", "enrollments.user_id")
     .innerJoin("tournaments", "tournaments.id", "enrollments.tournament_id")
     .where({tournament_id: tournamentID})
     .orderBy("team_id", "ascd")
     .then((playerStats) => {
      // console.log('team roster', playerStats);
       return _.groupBy(playerStats, "team_id");
     });
  }


  function getTeamEmails(tournamentID, teamID){
    return knex
     .select("tournaments.name", "users.email", 'users.battlenet_id')
     .from("enrollments")
     .innerJoin("users", "users.id", "enrollments.user_id")
     .innerJoin("tournaments", "tournaments.id", "enrollments.tournament_id")
     .where({tournament_id: tournamentID, team_id: teamID})
     .orderBy("team_id", "ascd")
     .then((playerEmails) => {
       return playerEmails;
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
      .from("enrollments")
      .innerJoin("users", "users.id", "enrollments.user_id")
      .where({tournament_id: tournamentID})
      .then((result) => {
        return result
      });
  }

  /**
   * Checks a string for special characters. Returns false if one is found
   * @param  {string} string string to be checked
   * @return {boolean}        returns true if invalid characters found
   */
  function checkInvalidCharacters(string){
    return /^[a-zA-Z0-9-#]*$/.test(string);
  }

  // Goes to new tournaments page
  router.get('/new', (req, res) => {
    if (!req.session.email) {
      // STRETCH: "Forbidden" error page
      res.sendStatus(403);
    }
    res.render('tournament_new',{email: req.session.email, userID: req.session.userID});
  });

  // Creates new tournament
  router.post("/new", (req, res) => {
    // GET PARAMS CORRECTLY
    const name = req.body.name;
    const teamCount = req.body.no_of_teams;
    const description = req.body.description;
    const twitchChannel = req.body.channel_name;
    console.log(req.body);

   // STRETCH: Show 'That name has been taken' error page
    if(!name || !description || !checkInvalidCharacters(twitchChannel) || !checkInvalidCharacters(description) || !checkInvalidCharacters(name)){
      console.log(`something is wrong`)
      console.log(name)
      console.log(description)
      console.log(checkInvalidCharacters(twitchChannel))
      console.log(checkInvalidCharacters(description))
      console.log(checkInvalidCharacters(name))
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
            .insert({name: name, no_of_teams: teamCount, description: description, creator_user_id: req.session.userID, is_started: false, twitch_channel: twitchChannel})
            .into('tournaments')
            .returning('id')
            .then((tournamentID)=> {
              for (let i = 0; i < teamCount; i++) {
                knex("teams")
                  .insert({"tournament_id": tournamentID[0]})
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


  router.get("/roles.json", (req, res) => {
    const tournamentID = req.query.tournamentID;
    const roles = ['offense', 'defense', 'tank', 'suport'];
    // if(req.session.email !== process.env.ADMIN_EMAIL) {
    //   // STRETCH: "Forbidden" error page
    //   res.sendStatus(403);
    // }
    // Gets player stats for each team in a specific tournament
    knex
      .select("users.battlenet_id", "team_id", "level", "role_summary")
      .from("enrollments")
      .innerJoin("users", "users.id", "enrollments.user_id")
      .innerJoin("tournaments", "tournaments.id", "enrollments.tournament_id")
      .where({tournament_id: tournamentID})
      .orderBy("team_id", "ascd")
      .then( async (teamRoster) => {
        for (let t = 0; t < teamRoster.length; t++) {
          teamRoster[t].role_summary = JSON.parse(teamRoster[t].role_summary)
        }
        const teamSummary = _.groupBy(_.sortBy(teamRoster, "level").reverse(), 'team_id');
        res.send(teamSummary);

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
      .select("tournaments.name", "users.battlenet_id", "team_id", "level", "games_won", "medal_gold", "medal_silver", "medal_bronze", "first_role", "users.id", "users.avatar")
      .from("enrollments")
      .innerJoin("users", "users.id", "enrollments.user_id")
      .innerJoin("tournaments", "tournaments.id", "enrollments.tournament_id")
      .where({tournament_id: tournamentID})
      .orderBy("team_id", "ascd")
      .then((playerStats) => {
        const teamRoster = _.groupBy(playerStats, "team_id");
        console.log('roster ',teamRoster);
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
    console.log(req.session.email)
    if (!req.session.email) {
      // Figure out better way to tell user that they need to sign in to save a score
      console.log('not a user');
      res.sendStatus(400);
    } else {
      knex
      .select('creator_user_id')
      .where({id: req.body.tournamentID})
      .from('tournaments')
      .then((results) =>{
        if(results.length === 0){
          return res.sendStatus(404);
        } if (results[0].creator_user_id === req.session.userID){
          knex("tournaments")
          .where({"id": req.body.tournamentID})
          .update({"brackets": req.body.bracketData})
          .then(() => {
            
            return res.sendStatus(200);
          });
        } else {
          return res.sendStatus(400);
        }
      });
    }
  });

 





  router.get("/:id/admin", (req, res) => {
    const tournamentID = parseInt(req.params.id);

    knex
      .select("id", "is_started", "creator_user_id", "no_of_teams", "name", "twitch_channel")
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
          const twitchChannel = `https://player.twitch.tv/?channel=${results[0].twitch_channel}`;
          const twitchChat = `http://www.twitch.tv/${results[0].twitch_channel}/chat?darkpopout`;
          const twitchName = results[0].twitch_channel;
          if (isReady && started) {
            res.render("tournament_view", {
              teamRoster: getTeamRoster(tournamentID),
              playerCount: enrolledPlayers.length,
              tournamentDescr: results[0].description,
              tournamentName: results[0].name,
              tournamentID: tournamentID,
              email: req.session.email,
              userID: req.session.userID,
              started: started,
              twitchChannel: twitchChannel,
              twitchChat: twitchChat,
              twitchName: twitchName,
              isOwner: isOwner})
          } else {
            res.render("tournament_staging", {
              playerCount: enrolledPlayers,
              players: enrolledPlayers.length,
              teamCount: results[0].no_of_teams,
              tournamentDescr: results[0].description,
              tournamentName: results[0].name,
              tournamentID: tournamentID,
              email: req.session.email,
              userID: req.session.userID,
              isReady: isReady
            });
          }
        } else {
          res.redirect(`/tournaments/${tournamentID}`);
        }
      })
  });

  router.get("/:id", async (req, res) => {
    const tournamentID = parseInt(req.params.id);
    const email = req.session.email

    if (tournamentID) {
      knex
      .select("id")
      .from("tournaments")
      .where({id: tournamentID})
      .then((results) =>{
        if (results.length === 0){
          res.render("404", {email: email, userID: req.session.userID,})
        }
      })
    }

    // const validID = await checkID(tournamentID);

    // console.log(validID)

    // if (!validID) {
    //   console.log('invalid ID')
    //   res.render("404", {email: email, userID: req.session.userID,})
    // }

    return knex
      .select("id", "is_started", "creator_user_id", "no_of_teams", "name", "twitch_channel")
      .from("tournaments")
      .where({id: tournamentID})
      .then( async (results) => {
        const enrolledPlayers = await playersEnrolled(tournamentID);
        const teamCount = results[0].no_of_teams;
        const started = results[0].is_started;
        const creatorUserID = results[0].creator_user_id;
        const isReady = (enrolledPlayers.length === teamCount * 6);
        const isOwner = (req.session.userID === creatorUserID);
        const twitchChannel = `https://player.twitch.tv/?channel=${results[0].twitch_channel}`;
        const twitchChat = `http://www.twitch.tv/${results[0].twitch_channel}/chat?darkpopout`;
        const twitchName = results[0].twitch_channel;
        console.log('This should be the results: ', results)
        if(isOwner) {
          res.redirect(`/tournaments/${tournamentID}/admin`);
        }

        if (isReady && started) {
          console.log('if you see me i am ready and have started')
          res.render("tournament_view", {
            teamRoster: getTeamRoster(tournamentID),
            playerCount: enrolledPlayers.length,
            email: req.session.email,
            userID: req.session.userID,
            started: started,
            tournamentName: results[0].name,
            tournamentID: tournamentID,
            isOwner: isOwner,
            twitchChannel: twitchChannel,
            twitchChat: twitchChat,
            twitchName: twitchName
          })
        } else {
          console.log("if you see me i am not started and am not ready, or both")
          res.render("tournament_notready", {
            tournamentName: results[0].name,
            playerCount: enrolledPlayers.length,
            maxPlayers: teamCount * 6,
            teamCount: results[0].no_of_teams,
            email: req.session.email,
            userID: req.session.userID,
            tournamentID: tournamentID
          })
        }
      });
  });

  router.post("/:id/start", (req, res) => {
    const tournamentID = parseInt(req.params.id);

    if (tournamentID) {
      knex
      .select("id")
      .from("tournaments")
      .where({id: tournamentID})
      .then((results) =>{
        if (results.length === 0){
          res.render("404", {email: email, userID: req.session.userID,})
        }
      })
    }
      // Lists players from highest level to lowest, then assigns a team ID #
      // to each player via an array
    knex
      .select("id", "name", "no_of_teams")
      .from("tournaments")
      .where({id: tournamentID})
      .then((results) => {
        console.log(results)
        // console.log('Tournament ID, ' + results[0].id);
        if(results.length === 0 ) {
          // STRETCH: Show 'No tournament of that name found' error page
          res.sendStatus(404);
        } else {
          knex
            .select("id", "level")
            .from("enrollments")
            .where({tournament_id: tournamentID})
            .orderBy("level", "desc")
            .then((playersArray) => {

              if (playersArray.length === (results[0].no_of_teams * 6)) {
                knex
                .select("id")
                .from("teams")
                .where({tournament_id: tournamentID})
                .then((teamArray) => {
                  initializeBrackets(teamArray, results[0].no_of_teams, tournamentID);
                  const teamAssigned = assignPlayersToTeams(playersArray, teamArray);
                  assignToTeams(teamAssigned);
                  setTournamentStarted(tournamentID);
                  res.redirect(`/tournaments/${tournamentID}/admin`);
                });
              } else {
                // STRETCH: Show 'Not Ready' error page
                res.sendStatus(400);
              }

            });
        }
      });
  });

  // Sends emails to team members in a tournament
  router.post("/:id/sendemail", (req, res) => {
    const tournamentID = parseInt(req.params.id);

    if (tournamentID) {
      knex
      .select("id")
      .from("tournaments")
      .where({id: tournamentID})
      .then((results) =>{
        if (results.length === 0){
          res.render("404", {email: email, userID: req.session.userID,})
        }
      })
    }

    knex
     .select("creator_user_id")
     .from("tournaments")
     .where({id: req.params.id})
     .then((creatorID) => {
      //Checking if the user is the owner
      if(creatorID[0].creator_user_id !== req.session.userID){
        res.sendStatus(403);
      } else {
        //Grabbing the emails for all team members
        getTeamEmails(req.params.id, req.body.teams)
        .then(function(results) {
          for(let i = 0; i < results.length; i++){
            const data = {
              from: 'Admin <mailer@tourneywatch.org>',
              to: results[i].email,
              subject: '[TourneyWatch] Message from Admin for tournament: ' + results[0].name,
              text: req.body.emailBody + "\n\n <THIS IS AN AUTOMATIC MESSAGE DO NOT REPLY>"
            };
            //Sending the email via mailgun-js
            mailGun.messages().send(data, function (error,body) {
              //Logging error/send messages
              console.log(body);
            })
          }
          res.redirect("/tournaments/" + req.params.id + "/");
        });
      }
     });
  });

  return router;
};
