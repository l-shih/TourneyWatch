
$(document).ready(function () {

  function renderTeamCards(teamRoster) {
    const teamNames = Object.keys(teamRoster)
    $(".tournamentheader").append(`
    <h1>${teamRoster["1"]["0"]["name"]}</h1>
    `)
    Object.keys(teamNames).forEach((t) => {
        $(".team-cards").append(`
        <div class="card mb-3" style="min-width: 15rem">
          <div class="card-header">${teamNames[t]}</div>
            <div class="card-body" data-team-id="${teamNames[t]}">
            </div>
        </div>
        `)

        //space after battlenet_id is required or function will break, do not remove.
        teamRoster[teamNames[t]].forEach((user) => {
          $(`[data-team-id="${teamNames[t]}"`).append(`
          <div class='container player'>
          <img class="player-class" src="/images/icon-${user.first_role}.png" title="${user.first_role}">
            <span data-balloon="Level: ${user.level} &#10;Games Won: ${user.games_won} &#10;Gold Medals: ${user.medal_gold} &#10;Silver Medals: ${user.medal_silver} &#10;Bronze Medals: ${user.medal_bronze}" 
            data-balloon-pos="right" data-balloon-break data-team = ${user.team_id}>
            ${user.battlenet_id}
            </span>
          </div>
            `)
        })
    })

    //If they're the owner, creates event listener to select users to swap
    if(isOwner){
      $('span').click(function(e){
        console.log("clicked")
        //TO DO make selector more specific ex. select span within div with team id of #
        //TO DO fix conditionals to make looks nicer
        if(($('.selected').length == 1 && $(e.target).data().team === $('.selected').data().team) && $('.selected').text() !== $(e.target).text()){
          return;
        }
        if($('.selected').length < 3){
          $(e.target).toggleClass('selected');
        }
        if($('.selected').length >= 3 && e.target.className.includes('selected')){
          $(e.target).toggleClass('selected');
        }
      });
    }

  }

  function loadCards() {
    console.log('i am in load cards', tournamentID);
    $.ajax({
      url: '/tournaments/cards.json',
      data: {tournamentID: tournamentID},
      method: 'GET'
    }).done((playerRoster) => {
      console.log(tournamentID);
      renderTeamCards(playerRoster);
    });
  }



  /**
   *
   * @param  {[type]}
   * @return {[type]}
   */
  function getPlayerEnrollmentData(bnetID){
    $.ajax({
      url: '/enrollments/' + tournamentID + '/enrollmentinfo.json',
      data: {bnetID: bnetID},
      method: 'GET'
    }).done((results) => {
      // console.log(results);
      return results
    });
  }



  $('#swap-players-button').click(function(e){
    const selectedPlayers = $(".selected").text().split(' ');
    $.ajax({
      url: '/enrollments/' + tournamentID + '/swap',
      data: {bnetID1: selectedPlayers[0], bnetID2: selectedPlayers[1]},
      method: 'post'
    }).done(() => {
      location.reload();
    });
  });

  loadCards();

  $("[data-toggle='toggle']").click(function() {
    const selector = $(this).data("target");
    $(selector).toggleClass('in');
  });

  $(".fa-clipboard").click(function() {
    const link = $(this).data("link")
    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(this).data("link")).select();
    document.execCommand("copy");
    $temp.remove();
    alert(`${link} has been copied!`)
  });

  //TESTING

    // Get the modal
  const modal = document.getElementById('swap-players-modal');

  // Get the button that opens the modal
  const btn = document.getElementById("swap-modal-button");

  // When the user clicks on the button, open the modal
  btn.onclick = async function() {

    if($('.selected').length < 2){
      alert('must select 2!');
      return;
    }
    modal.style.display = "block";

    //TO DO - find a way to use this and grab BOTH selected
    // console.log($('.selected').data());
    console.log('----');

    //TO DO -make this shit work
    // const selectedPlayers = $(".selected").text().split(' ');
    // const player1 = await  getPlayerEnrollmentData(selectedPlayers[0]);
    // const player2 = await  getPlayerEnrollmentData(selectedPlayers[1]);
    // console.log('battlnet id ', player1);



    // $('.swap-players-container').append(`

    //   <table>
    //     <tr>
    //       <th>Battlenet ID</th>
    //       <th>Role</th>
    //       <th>Level</th>
    //     </tr>
    //     <tr>
    //       <td></td>
    //       <td>Smith</td>
    //       <td>50</td>
    //     </tr>
    //     <tr>
    //       <td></td>
    //       <td>Jackson</td>
    //       <td>94</td>
    //     </tr>
    //   </table>
    // `);



    // console.log(selectedPlayers[0] + ' ' + selectedPlayers[1]);
    // $.ajax({
    //     url: '/tournaments/cards.json',
    //     data: {tournamentID: tournamentID},
    //     method: 'GET'
    //   }).done((playerRoster) => {
    //     //TO DO: there's gotta be a better way to do this....
    //     for(let i in playerRoster){
    //       // console.log(playerRoster[i]);
    //       for(let y in playerRoster[i]){
    //         // console.log(playerRoster[i][y]);
    //         if(selectedPlayers[0] === playerRoster[i][y].battlenet_id || selectedPlayers[1] === playerRoster[i][y].battlenet_id){
    //           // console.log('yarp!');
    //           $('.swap-players-container').append(`<h1>${playerRoster[i][y].battlenet_id}</h1><p>${playerRoster[i][y].first_role}<p>`);
    //         }
    //       }
    //     }
    //   });
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      $('.swap-players-container').empty();
        modal.style.display = "none";
    }
  }

});
