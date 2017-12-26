$(document).ready(function () {

  $("#new-tournament-form").on('submit', function (event) {
    event.preventDefault();
    var formData = {
      'no_of_teams': +$('select[id="entry-team"]').val(),
      'name': $('input[id=entry-name]').val(),
      'description': $('input[id=entry-description]').val(),
    };
    $.ajax({
      type: "POST",
      url: "/tournaments/new",
      data: formData,
      success: function () {
        console.log(formData);
        $("#new-tournament-form").html("Tournament Created!");
      }
    })
  })
});