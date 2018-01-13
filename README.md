# TourneyWatch

Tournament manager for Overwatch that seeds individual players in to evenly matched teams. TourneyWatch also allows all users, including spectators, to follow along through tournament brackets,  and team roster listings. Users can also view live games via Twitch integrations, and watch highlights uploaded by the manager.

<p align="center">
<img src="https://media.giphy.com/media/26gN1UEj5CJbnaI9y/giphy.gif" width="75%" height="75%" align="middle" />
</p>

## Getting Started

```
npm install
npm run local
open http://localhost:8080
```

If you'd like to try out our app with some pre-loaded data, please follow the following steps to run the seed file.

```
npm run knex migrate:latesst
npm run knex seed:run
```

Please note that the first user you register, after seeding the database, will own the first tournament. This user must have a valid PC gamer tag (ex. aaaa#3303)

The first tournament can be started by navigating to your profile (under the navbar's User Options) and clicking the "as Manager" tab, or you can enter http://localhost:8080/t/1 in to your adress bar.

<p align="center">
<img src="https://media.giphy.com/media/l0HUf8kHuq39iBbSE/giphy.gif" width="75%" height="75%" align="middle" />
</p>

## Stack

* Javascript
* Express.js
* Node.js
* EJS
* jQuery
* PostgreSQL
* Bootstrap4

## Contributors

* <a href="https://github.com/kevin-rph-lee">Kevin Lee</a>
* <a href="https://github.com/WhtMage">Chris Northwood</a>
* <a href="https://github.com/l-shih">Lilian Shih</a>
* <a href="https://github.com/Mochirii">Mel Smith</a>