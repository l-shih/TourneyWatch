"use strict";

const express = require('express');
const router = express.Router();

module.exports = (knex, bcrypt, cookieSession, owjs, _) => {

  /**
   * Checks a string for special characters. Returns false if one is found
   * @param  {string} string string to be checked
   * @return {boolean}        returns true if invalid characters found
   */
  function checkInvalidCharacters(string) {
    return !(/^[a-zA-Z0-9-#]*$/.test(string));
  }

  function validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return (true)
    }
      return (false)
  }

  function getUserIconAndbnetID(userID) {
    return knex
      .select("battlenet_id")
      .from("users")
      .where({ id: userID })
  }

  function checkInvalidbnetID(bnetID) {
    owjs.getAll('pc', 'us', bnetID)
      .then(() => {
        return false;
      })
      .catch((err) => {
        return true;
      })
  }

  function getPlayerInfo(bnetID){
    return owjs.getAll('pc', 'us', convertBnetID(bnetID))
  }

  /**
   * Converts a BNET ID into a string that Overwatch-js can handle
   * @param  {String} bnetID the BNET ID to convert
   * @return {String}        Bnet ID that Overwatch-js can handle
   */
  function convertBnetID(bnetID) {
    let name = bnetID.toLowerCase();
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name.replace('#', '-');
  }

  function playersEnrolled(tournamentID) {
    return knex
      .select("users.battlenet_id", "level", "games_won", "medal_gold", "medal_silver", "medal_bronze")
      .from("enrollments")
      .innerJoin("users", "users.id", "enrollments.user_id")
      .where({ tournament_id: tournamentID })
      .then((result) => {
        return result
      });
  }

  //Goes to registration page
  router.get('/new', (req, res) => {
    knex("users")
      .max("id")
      .then((results) => {
        const userID = results[0].max
        res.render('register', { email: req.session.email, userID: userID });
      })

  });

  //Gives back a JSON with player info (time & avatar) from OWJS
  //Auto-updates the avatar (if the user has changed the avatar on BNET)
  router.get('/:id/profileinfo.json', (req, res) => {
    knex
    .select('battlenet_id')
    .from('users')
    .where({id:req.params.id})
    .then((results) => {
      getPlayerInfo(results[0].battlenet_id)
      .then((results) => {
        knex('users')
        .where({ id:req.params.id })
        .update({ avatar:results.profile.avatar })
        .then(()=>{
          // Checks if the user is under level 100. If the user is, removes the leading 0 in their level
          let level = '';
          if(results.profile.tier === 0){
            level = results.profile.level.toString();
          } else if(results.profile.tier > 0 && results.profile.level < 10){
            level = results.profile.tier.toString() + '0' + results.profile.level.toString();
          } else {
            level = results.profile.tier.toString() + results.profile.level.toString();
          }
          const profileInfo = {avatar:results.profile.avatar, level:level, playTime:[]};
          for(let hero in results.quickplay.heroes){
            profileInfo.playTime.push({
              heroName: hero,
              timePlayed: results.quickplay.heroes[hero].time_played,
              multikill_best: (!results.quickplay.heroes[hero].multikill_best) ? 0 : results.quickplay.heroes[hero].multikill_best,
              weapon_accuracy: (!results.quickplay.heroes[hero].weapon_accuracy) ? 0 : results.quickplay.heroes[hero].weapon_accuracy,
            })
          }
          const sortedTimePlayed = _.sortBy(profileInfo.playTime, "timePlayed").reverse();
          profileInfo.playTime = sortedTimePlayed;
          res.json(profileInfo);
        })
      })
    })
  });

  //Goes to login page
  router.get('/login', (req, res) => {
    res.render('login', { email: req.session.email });
  });

  //user registers
  router.post("/new", (req, res) => {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password.trim();
    const battlenetID = req.body.battlenet.trim();
    const battlenetIDLower = req.body.battlenet.trim().toLowerCase();
    //Converting bnet ID into a format that owjs can take
    if(!email || !password || !battlenetID){
      return res.status(400).send("All fields must be filled!")
    }
    if (checkInvalidCharacters(battlenetID)) {
      return res.status(400).send("Invalid battlenet ID format!");
    }
    if (!(validateEmail(email))){
      return res.status(400).send('Invalid email format!');
    }
    //checking to prevent BNET/Email dupes
    knex('users')
      .select("email")
      .from("users")
      .whereRaw(`LOWER(battlenet_ID) LIKE ?`, battlenetIDLower)
      .orWhere({email:email})
      .then((results) => {
        if (results.length === 0) {
          owjs.getAll('pc', 'us', convertBnetID(battlenetID))
            .then((results) => {
              knex
                .insert({email: email, password: bcrypt.hashSync(password, 10), battlenet_id: battlenetID, avatar: results.profile.avatar})
                .into('users')
                .returning('id')
                .then((results) => {
                  req.session.userID = results[0];
                  req.session.email = email;
                  req.session.battlenetID = battlenetID;
                  res.send(results);
                });
            })
            .catch((err) => {
              res.status(400).send("Invalid Battlet Net ID!");
            })
          //stuff tha relies on it
        } else {
          res.status(400).send("Looks like you're already enrolled! Please check your email or Battle.net ID...");
        }
      });
  });

  // Route to send down the successfully logged in user's ID
  // in order to redirect them to their profile page after log in
  router.get("/info.json", (req,res) => {
    knex
      .select("id")
      .from("users")
      .where({email: req.query.email})
      .then((userID) => { res.json(userID[0]); })
  })

  // logs a user in
  router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      res.sendStatus(400);
      return;
    }

    // Checking if user already exists, if user does not exist, throw back a 404
    knex
      .select("password", "id")
      .from("users")
      .where({ email: email })
      .then((results) => {
        if (results.length === 0) {
          res.sendStatus(404);
        } else if (bcrypt.compareSync(password, results[0].password)) {
          req.session.email = email;
          req.session.userID = results[0].id;
          res.sendStatus(200);
        } else {
          res.sendStatus(403);
        }
      });
  });

  // User logs out
  router.post("/logout", (req, res) => {
    req.session = null;
    res.send({ result: true });
  });



  router.get("/:id", (req, res) => {
    const email = req.session.email
    const userID = parseInt(req.params.id);

    if (!email) {
      res.render('index', { email: email })
      return;
    } else {
      knex
        .select("id")
        .from("users")
        .where({id: userID})
        .then((results) => {
          if (results.length === 0) {
            res.render("404", {email: email, userID: req.session.userID,})
          }
        })
    }

    if (!email) {
      res.render('index', { email: email })
    } else {

      const asPlayerList = [];
      const asOwnerList = [];
      knex
        .select("tournament_id", "tournaments.name", "tournaments.is_started")
        .from("enrollments")
        .innerJoin("tournaments", "tournaments.id", "enrollments.tournament_id")
        .innerJoin("users", "users.id", "enrollments.user_id")
        .where({ 'users.id': req.params.id })
        .then(async (asPlayer) => {
          for (let t = 0; t < asPlayer.length; t++) {
            const playerRosterCount = await playersEnrolled(asPlayer[t].tournament_id);
            asPlayer[t].enrolledPlayers = playerRosterCount.length;
            asPlayerList.push(asPlayer[t]);
          }
          knex
            .select("tournaments.id", "name", "is_started", "no_of_teams")
            .from("tournaments")
            .innerJoin("users", "users.id", "tournaments.creator_user_id")
            .where({ 'users.id': req.params.id  })
            .then(async (asOwner) => {
              for (let t = 0; t < asOwner.length; t++) {
                const ownerRosterCount = await playersEnrolled(asOwner[t].id);
                asOwner[t].enrolledPlayers = ownerRosterCount.length;
                const isReady = (asOwner[t].enrolledPlayers === (asOwner[t].no_of_teams * 6));
                if (!isReady) {
                  asOwner[t].status = "Waiting";
                } else if (isReady && asOwner[t].is_started) {
                  asOwner[t].status = "In Progress";
                } else {
                  asOwner[t].status = "Ready";
                }
                asOwnerList.push(asOwner[t]);
              }
              //TO DO - REFACTOR SO NOT CALLBACK HELL

              getUserIconAndbnetID(req.params.id)
                .then((results) => {
                  //isUser is true if the user logged in is looking at their own profile
                  let isUser = false;
                  if(parseInt(req.session.userID) === parseInt(req.params.id)){
                    isUser = true;
                  }
                  res.render('profile', {
                    email: req.session.email,
                    asPlayerList: asPlayerList,
                    asOwnerList: asOwnerList,
                    battlenetID: results[0].battlenet_id,
                    userID: req.params.id,
                    isUser: isUser
                  });
                })
            });
        })
    }
  })

  router.post("/:id/edit", (req, res) => {
    if (parseInt(req.params.id) !== parseInt(req.session.userID)) {
      return res.sendStatus(400)
    }

      const password = req.body.password.trim();
      const battlenetID = req.body.battlenet.trim();
      const battlenetIDLower = req.body.battlenet.trim().toLowerCase();

      //Converting bnet ID into a format that owjs can take

      if (checkInvalidCharacters(battlenetID)) {
        return res.sendStatus(200);
      }
      //checking to prevent BNET/Email dupes
      knex('users')
        .select("email", "id")
        .from("users")
        .whereRaw(`LOWER(battlenet_ID) LIKE ?`, battlenetIDLower)
        .then((results) => {
          if((results.length === 0) || (Number(req.params.id) === Number(req.session.userID))){
            owjs.getAll('pc', 'us', convertBnetID(battlenetID))
              .then(() => {
                knex("users")
                .where({id:req.session.userID})
                .update({battlenet_id:battlenetID, password: bcrypt.hashSync(password, 10) })
                .then(() => {
                    req.session.battlenetID = battlenetID;
                    res.sendStatus(200);
                  });
              }).catch((err) => {
                res.status(400).send("Our system hit an error, try again later!")
              })
          } else {
            return res.status(400).send("Please check your information and resubmit...")
          }
        });
    });
  return router;
}
