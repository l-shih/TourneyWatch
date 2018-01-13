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



  function capFirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
  }

  function generateName(){
    var name1 = ["afraid","ancient","angry","average","bad","big","bitter","blue","bold","brave","breezy","bright","brown","calm","chatty","chilly","clever","cold","cowardly","cuddly","curly","curvy","dangerous","dry","dull","empty","evil","fast","fat","fluffy","foolish","fresh","friendly","funny","fuzzy","gentle","giant","good","great","green","grumpy","happy","hard","heavy","helpless","honest","horrible","hot","hungry","itchy","jolly","kind","lazy","light","little","loud","lovely","lucky","massive","mean","mighty","modern","moody","nasty","neat","nervous","new","nice","odd","old","orange","ordinary","perfect","pink","plastic","polite","popular","pretty","proud","purple","quick","quiet","rare","red","rotten","rude","selfish","serious","shaggy","sharp","short","shy","silent","silly","slimy","slippery","smart","smooth","soft","sour","spicy","splendid","spotty","stale","strange","strong","stupid","sweet","swift","tall","tame","tasty","tender","terrible","thin","tidy","tiny","toxic","tricky","ugly","unlucky","warm","weak","wet","white","wicked","wise","witty","wonderful","yellow","young"]

    var name2 = ["doomfist","genji","mccree","pharah","reaper","soldier 76","sombra","tracer","bastion","hanzo","junkrat","mei","torbjorn","widowmaker","dva","orisa","reinhardt","roadhog","winston","zarya","ana","lucio","mercy","moira","symmetra","zenyatta","mondatta","pachimari","volskaya","snowball","ganymede","athena","oasis","nepal","hanamura","lijiang","numbani","ilios","gibraltar","junkertown","kings Row","anubis","eichenwalde","dorado","hollywood","castillo","66","necropolis","antarctica","talon","blackwatch","omnics","helix","shimada","rikimaru","vishkar","shambali","hyde","lucheng","kofi aromo","lumeriCo","goldshire","axiom","blizzard","sigma","meteor","adawe","izumi","calaveras","orca","slipstream","kelvin","bludger","hypertrain","sandcrawler","nulltrooper","slicer","eradicator","detonator","training bot","lacroix"]

    var name = capFirst(name1[getRandomInt(0, name1.length + 1)]) + ' ' + capFirst(name2[getRandomInt(0, name2.length + 1)]) + 's';
    return name;

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
        [{ name: teamArray[b].team_name    , flag: "in" },
         { name: teamArray[b + 1].team_name, flag: "in" },]
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
     .select("tournaments.name", "users.battlenet_id","teams.team_name", "team_id", "level", "games_won", "medal_gold", "medal_silver", "medal_bronze", "users.id", "first_role", "second_role")
     .from("enrollments")
     .innerJoin("users", "users.id", "enrollments.user_id")
     .innerJoin("tournaments", "tournaments.id", "enrollments.tournament_id")
     .innerJoin("teams", "enrollments.team_id", "teams.id")
     .where({"enrollments.tournament_id": tournamentID})
     .orderBy("team_id", "ascd")
     .then((playerStats) => {
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
    return /^[a-zA-Z0-9-#-\s]*$/.test(string);
  }

  // Goes to new tournaments page
  router.get('/new', (req, res) => {
    if (!req.session.email) {
      // STRETCH: "Forbidden" error page
      res.redirect('/users/login')
    };
    res.render('tournament_new',{email: req.session.email, userID: req.session.userID, error: "none"});
  });

  // Creates new tournament
  router.post("/new", (req, res) => {
    // GET PARAMS CORRECTLY
    const name = req.body.name;
    const teamCount = req.body.no_of_teams;
    const description = req.body.description;
    const twitchChannel = req.body.channel_name;
    const date = req.body.date;
    console.log(req.body);

   // STRETCH: Show 'That name has been taken' error page
    if(!checkInvalidCharacters(twitchChannel) || !checkInvalidCharacters(description) || !checkInvalidCharacters(name)){
      console.log(checkInvalidCharacters(twitchChannel))
      console.log(checkInvalidCharacters(description))
      console.log(checkInvalidCharacters(name))
      return res.status(400).send('Invalid characters');
    }
    if(!date){
      return res.status(400).send('No date');
    }
    if(!name || !description){
      return res.status(400).send('Name and description must not be empty')
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
            .insert({name: name, no_of_teams: teamCount, description: description, creator_user_id: req.session.userID, is_started: false, twitch_channel: twitchChannel, date: date})
            .into('tournaments')
            .returning('id')
            .then((tournamentID)=> {
              for (let i = 0; i < teamCount; i++) {
                const teamName = generateName();
                knex("teams")
                  .insert({"tournament_id": tournamentID[0], "team_name": teamName})
                  .then(() => {});
              }
              return res.send(tournamentID);
            });
        } else {
          console.log("erroring here")
          return res.status(400).send('Team already exists');;
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
      .select("users.battlenet_id", "team_id", "level", "role_summary", 'teams.team_name')
      .from("enrollments")
      .innerJoin("users", "users.id", "enrollments.user_id")
      .innerJoin("tournaments", "tournaments.id", "enrollments.tournament_id")
      .innerJoin('teams', 'teams.id', 'enrollments.team_id')
      .where({'enrollments.tournament_id': tournamentID})
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
      .select("tournaments.name", "users.battlenet_id",'teams.team_name', "team_id", "level", "games_won", "medal_gold", "medal_silver", "medal_bronze", "first_role", "users.id", "users.avatar")
      .from("enrollments")
      .innerJoin("users", "users.id", "enrollments.user_id")
      .innerJoin("tournaments", "tournaments.id", "enrollments.tournament_id")
      .innerJoin('teams', 'enrollments.team_id', 'teams.id')
      .where({'enrollments.tournament_id': tournamentID})
      .orderBy("team_id", "ascd")
      .then((playerStats) => {
        const teamRoster = _.groupBy(playerStats, "team_name");
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
        res.json(results[0]);
      });
  });

  // Updates bracket data in the DB
  // TO DO: add security to this
  router.post("/update", (req, res) => {
    console.log(req.session.email)
    if (!req.session.email) {
      // Figure out better way to tell user that they need to sign in to save a score
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
            console.log("Owner has saved")

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
      .select("id", "is_started", "creator_user_id", "no_of_teams", "name", "twitch_channel", "description", "date")
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
              // teamRoster: getTeamRoster(tournamentID),
              playerCount: enrolledPlayers.length,
              tournamentDescr: results[0].description,
              tournamentName: results[0].name,
              tournamentDate: results[0].date,
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
              playerRoster: enrolledPlayers,
              playersCount: enrolledPlayers.length,
              teamCount: results[0].no_of_teams,
              tournamentDescr: results[0].description,
              tournamentName: results[0].name,
              tournamentDate: results[0].date,
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

    if (!Number.isInteger(tournamentID)) {
      res.render("404", {email: email, userID: req.session.userID,})
      return
    } else {
      knex
      .select("id")
      .from("tournaments")
      .where({id: tournamentID})
      .then((results) =>{
        if (results.length === 0){
          res.render("404", {email: email, userID: req.session.userID,})
          return;
        } else {
          knex
            .select("id", "is_started", "creator_user_id", "no_of_teams", "name", "twitch_channel", "description", "date")
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
                  playerCount: enrolledPlayers.length,
                  email: req.session.email,
                  userID: req.session.userID,
                  started: started,
                  tournamentName: results[0].name,
                  tournamentDescr: results[0].description,
                  tournamentDate: results[0].date,
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
                  tournamentDate: results[0].date,
                  maxPlayers: teamCount * 6,
                  teamCount: results[0].no_of_teams,
                  email: req.session.email,
                  userID: req.session.userID,
                  tournamentID: tournamentID
                })
              }
            });
        }
      })
    }
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
          res.render("404", {email: email, userID: req.session.userID,});
        } else {
          knex
            .select("id", "level")
            .from("enrollments")
            .where({tournament_id: tournamentID})
            .orderBy("level", "desc")
            .then((playersArray) => {

              if (playersArray.length === (results[0].no_of_teams * 6)) {
                knex
                .select("id","team_name")
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
