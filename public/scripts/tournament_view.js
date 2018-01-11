$(document).ready(() => {
  function renderTeamCards(teamRoster) {
    const teamNames = Object.keys(teamRoster);
    Object.keys(teamNames).forEach((t) => {
      $('.team-cards').append(`
      <div class="card mb-3" style="min-width: 17rem">
        <div class="card-header">${teamNames[t]}</div>
          <div class="card-body" data-team-id="${teamNames[t]}">
          </div>
      </div>
      `);

      // space after battlenet_id is required or function will break, do not remove.
      teamRoster[teamNames[t]].forEach((user) => {
        $(`[data-team-id="${teamNames[t]}"`).append(`
        <div class='container player'>
          <a href="/users/${user.id}"><img class="player-class" src="/images/icon-${user.first_role}.png" title="${user.first_role}"></a>
          <span data-balloon=" Level: ${user.level} &#10; Games Won: ${user.games_won} &#10; Gold Medals: ${user.medal_gold} &#10; Silver Medals: ${user.medal_silver} &#10; Bronze Medals: ${user.medal_bronze}" data-balloon-pos="up" data-balloon-break data-team = ${user.team_id} class="player">${user.battlenet_id} </span>
        </div>
        `);
      });
    });
  }

  function loadCards() {
    $.ajax({
      url: '/tournaments/cards.json',
      data: { tournamentID },
      method: 'GET',
    }).done((playerRoster) => {
      renderTeamCards(playerRoster);
    });
  }

  /**
   * Gets enrollment data for a single user from the bnet servers
   * @param  {[string]}  Bnet ID of the user info selected
   * @return {[Promise]} Data from the Bnet server
   */
  function getPlayerEnrollmentData(bnetID) {
    return $.ajax({
      url: `/enrollments/${tournamentID}/enrollmentinfo.json`,
      data: { bnetID },
      method: 'GET',
    });
  }

  loadCards();

  // Copy to clipboard function under share button
  $('.fa-clipboard').click(function () {
    const link = $(this).data('link');
    const $temp = $('<input>');
    $('body').append($temp);
    $temp.val($(this).data('link')).select();
    document.execCommand('copy');
    $temp.remove();
    $('.copy-alert').append(`
    <br>
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
    <strong>DONE!</strong> ${link} was copied!
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <br>
    `);

    window.setTimeout(() => {
      $('.alert').fadeTo(500, 0).slideUp(500, function () {
        $(this).remove();
      });
    }, 4000);
  });

  // Share button functionality to show share options
  let showShare = false;
  $('#share-button').click(() => {
    if (!showShare) {
      console.log('show twitch');
      showShare = true;
      $('#share').css({ display: 'block' });
    } else {
      console.log('hide char');
      showShare = false;
      $('#share').css({ display: 'none' });
    }
  });

  // Twitch button functionality to show twitch stream and chat
  let showTwitch = false;
  $('#twitch-button').click(() => {
    if (!showTwitch) {
      console.log('show twitch');
      showTwitch = true;
      $('.container-fluid').css({ display: 'block' });
    } else {
      console.log('hide char');
      showTwitch = false;
      $('.container-fluid').css({ display: 'none' });
    }
  });

  // TO DO: make this look....  nicer.
  const modalHighlights = document.getElementById('highlights-modal');
  const btnHighlights = document.getElementById('highlights-button');
  btnHighlights.onclick = function () {
    let highlightsString = "<div class = 'highlights'>";
    $.ajax({
      url: `/highlights/${tournamentID}`,
      method: 'GET',
    }).done((highlights) => {
      for (let i = 0; i < highlights.length; i++) {
        highlightsString +=
        `<div>
          <div class = 'wrapper'>
            <iframe class="embed-responsive embed-responsive-16by9" src="https://www.youtube.com/embed/${highlights[i].url}?autoplay=0" frameborder="0" gesture="media" allow="encrypted-media" allowfullscreen></iframe>
          </div>
        </div>`;
      }
      highlightsString += '</div>';
      $('.highlights-container').append(highlightsString);
      console.log(highlightsString);
      $('.highlights').slick();
      modalHighlights.style.display = 'block';
    });
  };

  window.onclick = function (event) {
    console.log('spectator clicks');
    if (event.target == modalHighlights) {
      $('.highlights-container').empty();
      modalHighlights.style.display = 'none';
    }
  };

  if (isOwner) {
    // TO DO: make this look....  nicer.
    const modalSwap = document.getElementById('swap-players-modal');
    const btnSwap = document.getElementById('swap-modal-button');
    $('#swap-players-button').click((e) => {
      const selectedPlayers = $('.selected').text().split(' ');
      $.ajax({
        url: `/enrollments/${tournamentID}/swap`,
        data: { bnetID1: selectedPlayers[0], bnetID2: selectedPlayers[1] },
        method: 'post',
      }).done(() => {
        location.reload();
      });
    });

    btnSwap.onclick = function () {
      if ($('.selected').length < 2) {
        $('.swap-alert').append(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>OOPS!</strong> Please select two players in order to swap!
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>
        `);
        window.setTimeout(() => {
          $('.alert').fadeTo(500, 0).slideUp(500, function () {
            $(this).remove();
          });
        }, 4000);
        return;
      }
      modalSwap.style.display = 'block';

      // To define variables for player swap functionality
      const selectedPlayers = $('.selected').text().split(' ');
      const player1 = getPlayerEnrollmentData(selectedPlayers[0]);
      const player2 = getPlayerEnrollmentData(selectedPlayers[1]);

      Promise.all([player1, player2]).then((results) => {
        const player1 = results[0];
        const player2 = results[1];
        $('.swap-players-container').append(`
          <h3> Swap ${player1.battlenet_id} and ${player2.battlenet_id}?</h3>
          <div class="table-responsive col-md-6 swap-table">
            <table id="swap-players-table" class="table table-striped table-dark">
              <thead>
                <tr>
                  <th scope="col">Battlenet ID</th>
                  <th scope="col">Primary Class</th>
                  <th scope="col">Secondary Class</th>
                  <th scope="col">Level</th>
                </tr>
              </thead>
              <tbody class="player-table-stats">
                <tr>
                  <td>${player1.battlenet_id}</td>
                  <td><img class="player-class" src="/images/icon-${player1.first_role}.png" title="${player1.first_role}"></td>
                  <td><img class="player-class" src="/images/icon-${player1.second_role}.png" title="${player1.second_role}"></td>
                  <td>${player1.level}</td>
                </tr>
                <tr>
                  <td>${player2.battlenet_id}</td>
                  <td><img class="player-class" src="/images/icon-${player2.first_role}.png" title="${player2.first_role}"></td>
                  <td><img class="player-class" src="/images/icon-${player2.second_role}.png" title="${player2.second_role}"></td>
                  <td>${player2.level}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `);
      });
    };

    // TO DO: make this look....  nicer.
    const modalEmail = document.getElementById('send-email-modal');
    const btnEmail = document.getElementById('email-notifications-button');
    btnEmail.onclick = function () {
      modalEmail.style.display = 'block';
      $.ajax({
        url: `/enrollments/${tournamentID}/teamnames.json`,
        method: 'GET',
      }).done((teamNames) => {
        console.log(teamNames);
        console.log(teamNames.length);
        for (let i = 0; i < teamNames.length; i++) {
          $('#team-ids').append(`<option value="${teamNames[i].team_id}">${teamNames[i].team_name}</option>`);
        }
      });
    };

    // TO DO: make this look....  nicer.
    const modalRole = document.getElementById('role-summary-modal');
    const btnRole = document.getElementById('role-summary-button');
    btnRole.onclick = function () {
      $.ajax({
        url: '/tournaments/roles.json',
        data: { tournamentID },
        method: 'GET',
      }).done((teamSummary) => {
        const teamIDs = Object.keys(teamSummary);
        const teamNames = {};
        for (let t = 0; t < teamIDs.length; t++) {
          $('.link-to-teams').append(`<a href="#Team${teamIDs[t]}">${teamSummary[teamIDs[t]][0].team_name} </a>`);
          teamNames[teamIDs[t]] = teamSummary[teamIDs[t]][0].team_name;
        }
        for (let t = 0; t < teamIDs.length; t++) {
          $('.role-summary-container').append(`
          <a name="Team${teamIDs[t]}"><h3 class="summary-modal-text">${teamNames[teamIDs[t]]}</h3>
          <table id="team-summary" class="table table-striped table-dark" data-team-sum-id="${teamIDs[t]}">
            <thead>
              <tr>
                <th scope="col" style="width: 170px;">Battlenet ID</th>
                <th scope="col" class="center">Level</th>
                <th scope="col" class="center">Most Played</th>
                <th scope="col" class="center"></th>
                <th scope="col" class="center"></th>
                <th scope="col" class="center">Least Played</th>
              </tr>
            </thead>`);
          for (let p = 0; p < 6; p++) {
            const player = teamSummary[teamIDs[t]][p];
            $(`[data-team-sum-id="${teamIDs[t]}"`).append(`
                <tbody class="player-table-stats player-class">
                  <tr>
                    <td>${player.battlenet_id}</th>
                    <td class="center">${player.level}</th>
                    <td class="center"><img class="player-class" src="/images/icon-${player.role_summary[0].role}.png" title="${player.role_summary[0].role}"></td>
                    <td class="center"><img class="player-class" src="/images/icon-${player.role_summary[1].role}.png" title="${player.role_summary[1].role}"></td>
                    <td class="center"><img class="player-class" src="/images/icon-${player.role_summary[2].role}.png" title="${player.role_summary[2].role}"></td>
                    <td class="center"><img class="player-class" src="/images/icon-${player.role_summary[3].role}.png" title="${player.role_summary[3].role}"></td>
                  </tr>
                </tbody>
              </table>`);
          }
        }
      });
      modalRole.style.display = 'block';
    };

    // TO DO: make this look....  nicer.
    const modalManageHighlights = document.getElementById('manage-highlights-modal');
    const btnManageHighlights = document.getElementById('manage-highlights-button');
    btnManageHighlights.onclick = function () {
      $.ajax({
        url: `/highlights/${tournamentID}`,
        method: 'GET',
      }).done((highlights) => {
        $('.manage-highlights-container').append(`
            <div class="table-responsive">
            <h3 class="sub-header"> Delete Highlights </h3>
              <table class="table table-striped table-dark">
                <thead class="list">
                  <tr>
                    <th>Highlight Name</th>
                    <th>Preview</th>
                    <th>Delete?</th>
                  </tr>
                </thead>
                <tbody class="highlight-details">
                </tbody>
              </table>
            </div>
          </div>
        </div>`);
        for (let i = 0; i < highlights.length; i++) {
          $('.highlight-details').append(`<tr>
              <td>${highlights[i].name}</td>
              <td>
                <span class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title='<img src="http://img.youtube.com/vi/${highlights[i].url}/0.jpg">'><i class="fa fa-camera" aria-hidden="true"></i>
                </span>
              </td>
              <td>
                <button class="btn btn-secondary delete-highlight" data-id=${highlights[i].id}><i class="fa fa-trash-o" aria-hidden="true" data-id=${highlights[i].id}></i></button>
              </td>
            </tr>`);
        }
        $('span[data-toggle="tooltip"]').tooltip({
          animated: 'fade',
          placement: 'top',
          html: true,
        });


        $('.delete-highlight').click((e) => {
          const highlightID = $(e.target).data().id;
          $.ajax({
            url: `/highlights/${tournamentID}/delete/`,
            data: { id: highlightID },
            method: 'POST',
          }).done(() => {
            $(e.target).closest('tr').remove();
          });
        });

        // following code is adding functionality for new highlights added by user
        // instead of refreshing the page, these highlights are appended automatically
        $('.add-highlight').click((e) => {
          const highlightName = $('.highlight-name').val();
          const highlightURL = $('.highlight-url').val();
          $.ajax({
            url: `/highlights/${tournamentID}/new/`,
            data: { name: highlightName, url: highlightURL },
            method: 'POST',
          }).done((results) => {
            $('.highlight-name').val('');
            $('.highlight-url').val('');

            $('.highlight-details').append(`
            <tr>
              <td>${highlightName}</td>
              <td>
                <span class="btn btn-secondary" data-toggle="tooltip" title='<img src="http://img.youtube.com/vi/${highlightURL}/0.jpg">'><i class="fa fa-camera" aria-hidden="true"></i>
                </span>
              </td>
              <td>
                <button class="btn btn-secondary delete-highlight" data-id=${results.id}><i class="fa fa-trash-o" data-id=${results.id} aria-hidden="true"></i></button>
              </td>
            </tr>
            `);

            $('span[data-toggle="tooltip"]').tooltip({
              animated: 'fade',
              placement: 'right',
              html: true,
            });

            $('.delete-highlight').click((e) => {
              const highlightID = $(e.target).data().id;
              $.ajax({
                url: `/highlights/${tournamentID }/delete/`,
                data: { id: highlightID },
                method: 'POST',
              }).done(() => {
                $(e.target).closest('tr').remove();
              });
            });
          }).catch((err) => {
            $('.youtube-alert').append(`
          <div class="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>That URL is invalid!</strong> Make sure you place in the right URL...
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          </div>
          `);
          });
        });

        window.setTimeout(() => {
          $('.alert').fadeTo(500, 0).slideUp(500, function () {
            $(this).remove();
          });
        }, 4000);
        modalManageHighlights.style.display = 'block';
      });
    };

    // Average team levels chart functionality
    let showChart = false;
    $('.fa-bar-chart').click(() => {
      $('.myChart').empty();
      $.ajax({
        url: '/tournaments/cards.json',
        data: { tournamentID },
        method: 'GET',
      }).done((playerRoster) => {
        const teams = [];
        const averageLevels = [];
        console.log(playerRoster);

        for (const team in playerRoster) {
          let totalTeamLevel = 0;
          for (let i = 0; i < playerRoster[team].length; i++) {
            totalTeamLevel += playerRoster[team][i].level;
          }
          averageLevels.push((totalTeamLevel / 6).toFixed(2));
          teams.push(team);
        }
        console.log('teams', teams);
        const ctx = document.getElementById('myChart');
        const myChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: teams,
            datasets: [{
              label: 'Average Level',
              data: averageLevels,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',

              ],
              borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
              ],
              borderWidth: 1,
            }],
          },
          options: {
            scales: {
              yAxes: [{ ticks: { beginAtZero: true } }],
              xAxes: [{ ticks: { autoSkip: false } }],
            },
            legend: { display: false },
          },
        });
      });

      if (!showChart) {
        console.log('show char');
        showChart = true;
        $('.avg-team-levels').css({ display: 'block' });
      } else {
        console.log('hide char');
        showChart = false;
        $('.avg-team-levels').css({ display: 'none' });
      }
    });

    // When the user clicks anywhere outside of the modal,
    // modal will close, and information inside will be cleared
    window.onclick = function (event) {
      console.log('is owner clicks');
      if (event.target.className === 'player' || event.target.className === 'player selected') {
        if (($('.selected').length == 1 && $(event.target).data().team === $('.selected').data().team) && $('.selected').text() !== $(event.target).text()) {
          return;
        }
        if ($('.selected').length < 3) {
          $(event.target).toggleClass('selected');
        }
        if ($('.selected').length >= 3 && event.target.className.includes('selected')) {
          $(event.target).toggleClass('selected');
        }
      }
      if (event.target == modalSwap) {
        $('.swap-players-container').empty();
        $('span').removeClass('selected');
        modalSwap.style.display = 'none';
      }
      if (event.target == modalEmail) {
        $('#team-ids').empty();
        modalEmail.style.display = 'none';
      }
      if (event.target == modalRole) {
        $('.role-summary-container').empty();
        $('.link-to-teams').empty();
        modalRole.style.display = 'none';
      }
      if (event.target == modalManageHighlights) {
        $('.manage-highlights-container').empty();
        $('.highlight-name').val('');
        $('.highlight-url').val('');
        modalManageHighlights.style.display = 'none';
      }
      if (event.target == modalHighlights) {
        $('.highlights-container').empty();
        modalHighlights.style.display = 'none';
      }
    };
  }
});
