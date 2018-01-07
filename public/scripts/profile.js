
$(document).ready(function () {
  // console.log('I am ready');
  //

    /**
     * Removes underscores & replaces with space, along with capitalizes the first letter of each name
     * @param  {[name]} string Name of hero
     * @return {[String]}        Hero name with capitalized first letter along with underscore replaced with space
     */
    function jsUcfirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).replace("_", " ");
    }

    console.log('trying ajx')
    $.ajax({
      url: '/users/' + userID + '/profileinfo.json',
      method: 'GET'
    }).done((results) => {
      console.log(results);
      $('.profile-card').empty();
      $('.stats-container').empty();
      $('.profile-card').append(`
      <div class="profile-cover">
          <div class="profile-avatar">
              <a href="#"><img src="${results.avatar}" ></a>
          </div>
          <div class="profile-details">
              <h6> ${battlenetID} </h6>
          </div>
      </div>
      <div class="profile-info">
          <h1>Level: ${results.level}</h1>
          <div class="info-area">
            Bananas are the potatoes of fruit
          </div>
      </div>`)


      let statsTable = `

      <table class="table table-striped table-dark">
      <thead>
          <tr>
            <th scope="col">Hero</th>
            <th scope="col">Time Played (mins)</th>
          </tr>
        </thead>
      `;

      for(let hero in results.playTime){
        const timePlayed = moment.duration(results.playTime[hero]);
        console.log('time: ', timePlayed);
        statsTable += `

        <tbody class="tournament-details">
          <tr>
            <td scope="row">
                <img class="character-icon" src="/images/heroicons/${hero}.png">
              ${jsUcfirst(hero)}
            </td>
            <td scope="row">${Math.floor(Number(timePlayed.asMinutes()))}</td>
          </tr>
        </tbody>
        `
      }
      statsTable += `</table>`


      $('.stats-container').append(statsTable)



    }).catch((err) => {
      //TO DO: make look nice with a flash message or something
      alert('error!');
      console.log(err.status);
    });


  $('.submit').click(function(e){

    const password = $('#entry-password').val();
    const passwordConfirm = $('#entry-password-confirm').val();
    const battlenet = $('#entry-battlenet').val()

    

    if(password !== passwordConfirm){
      alert('Passswords do not match!');
      return;
    }

    console.log(password + battlenet);
    console.log(userID);
    $.ajax({
      url: '/users/' + userID + '/edit/',
      data: {password: password, battlenet: battlenet },
      method: 'POST'
    }).done(() => {
      //Redirects to the index
      window.location.reload();
    }).catch((err) => {
      //TO DO: make look nice with a flash message or something
      alert('error!');
      console.log(err.status);
    });
    //empty the DOM and insert a loader



  });

});
