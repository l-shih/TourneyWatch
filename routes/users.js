"use strict";

const express = require('express');
const router = express.Router();

module.exports = (knex, bcrypt, cookieSession, owjs) => {

  /**
   * Checks a string for special characters. Returns false if one is found
   * @param  {string} string string to be checked
   * @return {boolean}        returns true if invalid characters found
   */
  function checkInvalidCharacters(string) {
    return !(/^[a-zA-Z0-9-#]*$/.test(string));
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
    res.render('register', { email: req.session.email });
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
        .where({id:req.params.id})
        .update({avatar:results.profile.avatar})
        .then(()=>{
          const level = results.profile.tier.toString() + results.profile.level.toString()
          const profileInfo = {avatar:results.profile.avatar, level:level, playTime:{}};
          for(let hero in results.quickplay.heroes){
            profileInfo.playTime[hero] = results.quickplay.heroes[hero].time_played;
          }
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
    console.log(req.body);
    console.log(req.params)
    console.log(req.body.email)
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password.trim();
    const battlenetID = req.body.battlenet.trim();
    const battlenetIDLower = req.body.battlenet.trim().toLowerCase();
    console.log(battlenetIDLower);
    //Converting bnet ID into a format that owjs can take


    if (checkInvalidCharacters(battlenetID)) {
      return res.sendStatus(400);
    }
    //checking to prevent BNET/Email dupes
    knex('users')
      .select("email")
      .from("users")
      .whereRaw(`LOWER(battlenet_ID) LIKE ?`, battlenetIDLower)
      .orWhere({email:email})
      .then((results) => {
        console.log(results);
        if (results.length === 0) {
          owjs.getAll('pc', 'us', convertBnetID(battlenetID))
            .then((results) => {
              knex
                .insert({email: email, password: bcrypt.hashSync(password, 10), battlenet_id: battlenetID, avatar: results.profile.avatar})
                .into('users')
                .returning('id')
                .then(async (results) => {

                  req.session.userID = await results[0];
                  req.session.email = email;
                  req.session.battlenetID = battlenetID;
                  console.log('just registered, am results', results)
                  console.log('IN /NEW', req.session)
                  res.redirect(`/users/${req.session.userID}`);
                });
            })
            .catch((err) => {
              res.status(400).send("Our Systems are having an Error, please try back later!");
            })
          //stuff tha relies on it
        } else {
          res.send(400).send("tteeeeest")
        }
      });
  });


  // logs a user in
  router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // error checking
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
          console.log(results);
          console.log(req.session);
          res.redirect(`${req.session.userID}`);
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
    const email = req.session.email;
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
                  console.log(results);
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
      console.log('invalid password');
      return res.sendStatus(400)
    }

      const password = req.body.password.trim();
      const battlenetID = req.body.battlenet.trim();
      const battlenetIDLower = req.body.battlenet.trim().toLowerCase();

      //Converting bnet ID into a format that owjs can take

      if (checkInvalidCharacters(battlenetID)) {
        console.log('Invalid')
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
                  console.log('this shouldve worked');
                    req.session.battlenetID = battlenetID;
                    res.sendStatus(200);
                  });
              }).catch((err) => {
                console.log('OWJS fails')
                res.sendStatus(400);
              })
          } else {
            console.log('something else failse');
            return res.sendStatus(400)
          }
        });
    });
  return router;
}
