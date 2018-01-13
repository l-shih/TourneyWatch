
$(document).ready(function () {
});
    // not sure, going to guess logout do this one last
    $("#test").on('click', function (event) {
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "/users/logout",
            success: function (result) {
                location.href="/";

            }
        })
    })

    showTournamentID();
})

