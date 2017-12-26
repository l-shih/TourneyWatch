
$(document).ready(function () {

  function renderTeamCards(teamRoster) {
    const teamNames = Object.keys(teamRoster)
    $(".tournamentheader").append(`
    <h1>${teamRoster["1"]["0"]["name"]}</h1>
    `)
    Object.keys(teamNames).forEach((t) => {
      $(".row").append(`
      <div class="card mb-3" style="min-width: 15rem">
        <div class="card-header">${teamNames[t]}</div>
          <div class="card-body" data-team-id="${teamNames[t]}">
        </div>
      </div>
      `)

      teamRoster[teamNames[t]].forEach((user) => {
        $(`[data-team-id="${teamNames[t]}"`).append(`<p>${user.battlenet_id}</p>`)
      })
    })
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

  loadCards();

});