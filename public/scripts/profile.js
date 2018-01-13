
$(document).ready(function () {
    /**
     * Removes underscores & replaces with space, 
     * along with capitalizing first letter of each name
     * @param  {string} Name of hero
     * @return {string}
     */
    function nameTransform(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).replace("_", " ");
    }

    $.ajax({
      url: '/users/' + userID + '/profileinfo.json',
      method: 'GET'
    }).done((results) => {
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
          </div>
      </div>`);
      $('.stats-container').append(`
      <table class="table table-striped table-dark profile-hero-stats">
        <thead>
          <tr>
            <th scope="col">Hero</th>
            <th scope="col" style="text-align: center;">Time Played (mins)</th>
            <th scope="col" style="text-align: center;">Multi-Kills Best</th>
            <th scope="col" style="text-align: center;">Weapon Accuracy (%)</th>
          </tr>
        </thead>
        <tbody class="hero-details">
        </tbody>
      </table>`);
      for (let h = 0; h < results.playTime.length; h++) {
        let hero = results.playTime[h].heroName;
        let time = moment.duration(results.playTime[h].timePlayed);
        $('.hero-details').append(`
        <tr>
          <td scope="row">
            <div class="profile-hero">
              <img class="character-icon" src="/images/heroicons/${hero}.png">  ${nameTransform(hero)}
            </div>
          </td>
          <td scope="row" align="center">${Math.floor(time.asMinutes())}</td>
          <td scope="row" align="center">${results.playTime[h].multikill_best}</td>
          <td scope="row" align="center">${results.playTime[h].weapon_accuracy}</td>
        </tr>
        `)
      };
    }).catch((err) => {
      //TO DO: make look nice with a flash message or something
      alert('error!');
    });

  $('.submit').click(function(e){
    const password = $('#entry-password').val();
    const passwordConfirm = $('#entry-password-confirm').val();
    const battlenet = $('#entry-battlenet').val()
    $('.container').empty();
    $('.container').append('<div class="update-alert"></div><div class="loader-container"><div class="loader"><svg xmlns="http://www.w3.org/2000/svg" width="850" height="850" viewBox="0 0 850 850"><g id="circles"><circle class="bg" fill="none" stroke-width="10" stroke-miterlimit="10" cx="425" cy="425" r="400"/><circle class="fast" fill="none" stroke="#000" stroke-width="10" stroke-miterlimit="10" cx="425" cy="425" r="400"/><circle class="slow" fill="none" stroke-width="10" stroke-miterlimit="10" cx="425" cy="425" r="400"/></g><g id="hexas"><path d="M334.145 358.92c-2.7 1.56-7.12 1.56-9.82 0l-77.152-44.545c-2.7-1.56-4.91-5.386-4.91-8.504v-89.086c0-3.118 2.21-6.945 4.91-8.504l77.154-44.545c2.7-1.56 7.12-1.56 9.82 0l77.152 44.544c2.7 1.558 4.91 5.385 4.91 8.503v89.09c0 3.117-2.21 6.944-4.91 8.503l-77.155 44.544z"/><path d="M521.262 359.014c-2.7 1.56-7.12 1.56-9.82 0L434.29 314.47c-2.7-1.56-4.91-5.387-4.91-8.505v-89.087c0-3.118 2.208-6.945 4.91-8.504l77.153-44.545c2.7-1.56 7.12-1.56 9.82 0l77.152 44.542c2.7 1.56 4.91 5.386 4.91 8.504v89.09c0 3.117-2.21 6.944-4.91 8.503l-77.153 44.544z"/><path d="M614.9 521.2c-2.7 1.56-7.118 1.56-9.818 0l-77.153-44.543c-2.7-1.56-4.91-5.386-4.91-8.504v-89.088c0-3.118 2.208-6.945 4.91-8.504l77.153-44.544c2.7-1.56 7.12-1.56 9.82 0l77.15 44.544c2.7 1.56 4.91 5.386 4.91 8.504v89.09c0 3.117-2.208 6.943-4.91 8.503L614.902 521.2z"/><path d="M521.424 683.294c-2.7 1.56-7.12 1.56-9.82 0l-77.153-44.545c-2.7-1.56-4.91-5.387-4.91-8.505v-89.088c0-3.118 2.21-6.944 4.91-8.504l77.156-44.543c2.7-1.56 7.12-1.56 9.82 0l77.15 44.543c2.7 1.56 4.91 5.386 4.91 8.504v89.09c0 3.118-2.208 6.944-4.91 8.504l-77.152 44.544z"/><path d="M333.73 683.534c-2.7 1.56-7.118 1.56-9.818 0L246.76 638.99c-2.7-1.56-4.91-5.385-4.91-8.503v-89.09c0-3.118 2.21-6.944 4.91-8.504l77.153-44.543c2.7-1.56 7.12-1.56 9.82 0l77.152 44.543c2.7 1.56 4.91 5.386 4.91 8.504v89.088c0 3.118-2.21 6.944-4.91 8.504l-77.154 44.544z"/><path d="M240.09 521.345c-2.7 1.56-7.118 1.56-9.818 0l-77.153-44.543c-2.7-1.56-4.91-5.386-4.91-8.504V379.21c0-3.118 2.21-6.945 4.91-8.504l77.153-44.545c2.7-1.558 7.12-1.558 9.82 0l77.152 44.545c2.7 1.56 4.91 5.386 4.91 8.504v89.088c0 3.118-2.21 6.944-4.91 8.504l-77.154 44.543z"/><path d="M427.785 521.106c-2.7 1.56-7.12 1.56-9.82 0l-77.152-44.545c-2.7-1.56-4.91-5.385-4.91-8.503V378.97c0-3.118 2.21-6.945 4.91-8.504l77.153-44.545c2.7-1.558 7.12-1.558 9.82 0l77.153 44.545c2.7 1.56 4.91 5.386 4.91 8.504v89.087c0 3.118-2.21 6.944-4.91 8.504l-77.155 44.546z"/>    </g></svg></div></div></div>');

    if(password !== passwordConfirm){
      $('.update-alert').append(`
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>OOPS!</strong> Your passwords don't match, please try again.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      </div>
      `)
      return;
    }

    $.ajax({
      url: '/users/' + userID + '/edit/',
      data: {password: password, battlenet: battlenet },
      method: 'POST'
    }).done(() => {
      window.location.reload();
    }).catch((err) => {
      $('.update-alert').append(`
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>OOPS!</strong> ${err.responseText}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      </div>
      `)
      window.setTimeout(function() {
        $(".alert").fadeTo(500, 0).slideUp(500, function(){
          window.location.replace(`/users/${userID}`); 
        });
      }, 4000);
    });
  });
});
