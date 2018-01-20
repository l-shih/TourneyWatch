$(document).ready(function () {
  $("#logout-btn").on('click', function (event) {
    event.preventDefault();
    $.ajax({
      type: "POST",
      url: "/users/logout",
      success: function (result) {
          location.href="/";
      }
    })
  })
});