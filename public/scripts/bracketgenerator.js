$(function () {
    var demos = ['save',]
    $.each(demos, function (i, d) {
        var demo = $('div#' + d)
        $('<div class="demo"></div>').appendTo(demo)
    })
})

/* Called whenever bracket is modified
 *
 * data:     changed bracket object in format given to init
 * userData: optional data given when bracket is created.
 */
function saveFn(data) {
    var bracketData = JSON.stringify(data)
    $.ajax({
        type: "POST",
        url: "/tournaments/update/",
        data: {bracketData: bracketData, tournamentID: tournamentID}
     }).done(() => {
        $('.bracket-alert').append(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>UPDATED!</strong> Bracket has been successfully updated!
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>
        `)
     }).catch((error) => {
        $('.bracket-alert').append(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>OOPS!</strong> Something went wrong with your request!
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>
        `)
     });  

    window.setTimeout(function() {
    $(".alert").fadeTo(500, 0).slideUp(500, function(){
        $(this).remove(); 
    });
    }, 5000);
}


$(function () {
    var container = $('div#save .demo')

    $.ajax({
      type: "GET",
      url: "/tournaments/brackets.json",
      data: {tournamentID: tournamentID},
      success: function (results) {

        console.log('i am in bracketgenerator', results);
        container.bracket({
            init: results.brackets,
            save: saveFn,
            userData: "http://myapi"
        })

        $('div#save .demo').bracket({
          teamWidth: 81,
          scoreWidth: 27,
          matchMargin: 61,
          roundMargin: 71,
          centerConnectors: true,
          skipConsolationRound: true,
          init: results.brackets,
          disableToolbar: true,
          disableTeamEdit: true,
          save: function () { },
          decorator: {
              edit: edit_fn,
              render: render_fn
          }
      })
    }
})


    /* You can also inquiry the current data */

    //   $('#dataOutput').text(JSON.parse(data))


    $("#target").click(function () {
        var data = container.bracket('data')
        console.log("data", data)
        saveFn(data);
    });


})

/*for flag*/
/* Edit function is called when team label is clicked */
function edit_fn(container, data, doneCb) {
    var input = $('<input type="text">')
    input.val(data ? data.flag + ':' + data.name : '')
    container.html(input)
    input.focus()
    input.blur(function () {
        var inputValue = input.val()
        if (inputValue.length === 0) {
            doneCb(null); // Drop the team and replace with BYE
        }
    })
}

/* Render function is called for each team label when data is changed, data
 * contains the data object given in init and belonging to this slot.
 *
 * 'state' is one of the following strings:
 * - empty-tbd: No data or score yet. A team will advance here later
 * - entry-no-score: Data available, but no score given yet
 * - entry-default-win: Data available, score will never be given as opponent is BYE
 * - entry-complete: Data and score available
 */
function render_fn(container, data, score, state) {
    switch (state) {

        case "empty-tbd":
            container.append("Upcoming")
            return;
        case "entry-no-score":
        case "entry-default-win":
        case "entry-complete":
            container.append(data.name)
            return;
    }
}

$(function () {



})






//if( ${.hidden-owner}.text() === 'true)
