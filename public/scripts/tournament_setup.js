
$(document).ready(function () {
  // Will function for when a tournament has not started, or
  // if a person drops out after a tournament has started
  function renderPlayerCount(playerRoster) {
    const playerNames = playerRoster.undefined;
    // if !playerNames, a person dropped out after
    // tournament has started
    if (!playerNames) {
      let count = 1;
      Object.keys(playerRoster).forEach((i) => {
        for (let p = 0; p < playerRoster[i].length; p++) {
          $(".player-table-stats").append(`
          <tr data-player-id="${playerRoster[i][p].battlenet_id}">
            <td scope="row">${count++}</td>
            <td><img src="${playerNames[i].avatar}" class="avatar"> ${playerNames[i].battlenet_id}</td>
            <td>${playerRoster[i][p].level}</td>
            <td>${playerRoster[i][p].games_won}</td>
            <td>${playerRoster[i][p].elims_per_min}</td>
            <td>${playerRoster[i][p].k_d_ratio}</td>
          </tr>
        </tr>`)
        }
      })
    } else {
      Object.keys(playerNames).forEach((i) => {
          $(".player-table-stats").append(`
            <tr data-player-id="${playerNames[i].battlenet_id}">
              <td scope="row">${Number([i]) + 1}</td>
              <td><img src="${playerNames[i].avatar}" class="avatar"> ${playerNames[i].battlenet_id}</td>
              <td>${playerNames[i].level}</td>
              <td>${playerNames[i].games_won}</td>
              <td>${playerNames[i].elims_per_min}</td>
              <td>${playerNames[i].k_d_ratio}</td>
            </tr>
          </tr>`)
      })
    }
  }

  //IMPORTANT <td><img src="${playerNames[i].avatar}" class="avatar"> ${playerNames[i].battlenet_id}</td>

  function loadTable() {
    $.ajax({
      url: `/enrollments/enrollments.json`,
      data: {tournamentID: tournamentID},
      method: 'GET'
    }).done((playerRoster) => {
      renderPlayerCount(playerRoster);
    });
  }

  loadTable();


  // share btn  div sliding functionality
  let showShare = false;
  $("#share-button").click(function() {
    if (!showShare) {
      showShare = true;
      $("#share").css({"display": "block"});
    } else {
      showShare =false
      $("#share").css({"display": "none"});
    }
  });

  $(".fa-clipboard").click(function() {
    const link = $(this).data("link")
    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(this).data("link")).select();
    document.execCommand("copy");
    $temp.remove();
    $('.copied-alert').append(`
    <br>
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
    <strong>DONE!</strong> ${link} has been copied!
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    </div>
    `)
    window.setTimeout(function() {
      $(".alert").fadeTo(500, 0).slideUp(500, function(){
          $(this).remove(); 
      });
    }, 3000);
  })

});
