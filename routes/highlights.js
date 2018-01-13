"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  /**
   * Gets the youtube ID from a youtube URL
   * @param  {[STRING]} url youtube URL
   * @return {[STRING]}     youtube ID
   */
  function getYoutubeID(url){
    //TO DO - get a better function
    const VID_REGEX = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

    return (url.match(VID_REGEX)[1]);
  }

  router.get("/:id/", (req, res) => {
    knex
      .select('id', 'name', 'url')
      .from("highlights")
      .where({tournament_id : req.params.id})
      .then((results) => {
        res.send(results);
      });
  });

  router.post("/:id/new", (req, res) => {
    //TO-DO-Refactor to a promise chain
    //error checking
    if(!req.body.name || !req.body.url){
      return res.sendStatus(400);
    }
    knex
      .select('id', 'creator_user_id')
      .from("tournaments")
      .where({id : req.params.id})
      .then((results) => {
        if(results.length === 0){
          res.sendStatus(404);
        } else if (results[0].creator_user_id !== req.session.userID) {
          res.sendStatus(403);
        } else {
          //converst the full URL to a youtube ID. If invalid, throws and error and sends a 400 status back
          try{
            getYoutubeID(req.body.url);
          } catch(err){
            return res.sendStatus(400);
          }
          const youtubeID = getYoutubeID(req.body.url)
          knex
            .insert({name: req.body.name, url: youtubeID, tournament_id: req.params.id})
            .into('highlights')
            .returning('id')
            .then((id)=>{
              res.json({id:id[0], youtubeID:youtubeID});
              return;
            });
        }
      });
  });


  router.post("/:id/delete", (req, res) => {
    knex
      .select('id', 'creator_user_id')
      .from("tournaments")
      .where({id : req.params.id})
      .then((results) => {
        if(results.length === 0){
          res.sendStatus(404);
        //Ensuring that only the owner can delete highlights
        } else if (results[0].creator_user_id !== req.session.userID){
          res.sendStatus(403);
        } else {
          knex('highlights')
            .where({id: req.body.id})
            .del()
            .then(()=>{
              res.sendStatus(200);
            });
        }
      });
  });



  return router;
};
